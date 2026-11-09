
library(plumber)
library(DBI)
library(RPostgres)

# Load the database connection script
source("../R/database/db_connection.R")


#* Check API health
#* @get /api/health
#* @serializer json
function() {
  list(
    status = "success",
    message = "AgWaterDS API is running"
  )
}


#* Retrieve administrative units
#* @get /api/admin-units
#* @serializer json
function() {

  con <- connect_db()

  on.exit(DBI::dbDisconnect(con), add = TRUE)

  admin_data <- DBI::dbGetQuery(
    con,
    "
    SELECT
      admin_id,
      admin_name,
      country_name,
      country_code,
      area_sqkm,
      center_lat,
      center_lon
    FROM public.admin_units
    ORDER BY admin_name
    "
  )

  return(admin_data)
}

#* @get /api/evapotranspiration
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

  # Build SQL conditions using parameterized queries
  conditions <- character()
  params <- list()

  if (!is.null(admin_id) && nzchar(admin_id)) {
    conditions <- c(conditions, paste0("admin_id = $", length(params) + 1))
    params <- c(params, list(admin_id))
  }

  if (!is.null(start_date) && nzchar(start_date)) {
    conditions <- c(conditions, paste0("observation_date >= $", length(params) + 1))
    params <- c(params, list(as.Date(start_date)))
  }

  if (!is.null(end_date) && nzchar(end_date)) {
    conditions <- c(conditions, paste0("observation_date <= $", length(params) + 1))
    params <- c(params, list(as.Date(end_date)))
  }

  sql <- "
    SELECT
      admin_id,
      observation_date,
      mean_et,
      unit,
      data_source
    FROM public.evapotranspiration
  "

  if (length(conditions) > 0) {
    sql <- paste(sql, "WHERE", paste(conditions, collapse = " AND "))
  }

  sql <- paste(sql, "ORDER BY observation_date, admin_id")

  result <- DBI::dbGetQuery(
    con,
    sql,
    params = params
  )

  return(result)
}