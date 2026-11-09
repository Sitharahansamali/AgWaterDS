
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


#* Retrieve evapotranspiration observations
#*
#* @param admin_id Optional administrative unit ID, e.g. NG001
#* @param start_date Optional start date, e.g. 2025-01-01
#* @param end_date Optional end date, e.g. 2026-12-01
#*
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


#* Retrieve soil moisture observations
#*
#* @param admin_id Optional administrative unit ID
#* @param start_date Optional start date
#* @param end_date Optional end date
#*
#* @get /api/soil-moisture
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

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
      mean_soil_moisture,
      unit,
      data_source
    FROM public.soil_moisture
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



#* Retrieve water balance observations
#*
#* @param admin_id Optional administrative unit ID
#* @param start_date Optional start date
#* @param end_date Optional end date
#*
#* @get /api/water-balance
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

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
      water_supply,
      water_demand,
      water_deficit,
      unit,
      data_source
    FROM public.water_balance
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


#* Retrieve crop water demand observations
#*
#* @param admin_id Optional administrative unit ID
#* @param start_date Optional start date
#* @param end_date Optional end date
#*
#* @get /api/crop-water-demand
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

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
      water_demand,
      unit,
      data_source
    FROM public.crop_water_demand
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

