
# ==========================================
# AgWaterDS REST API
# ==========================================

library(plumber)
library(DBI)
library(RPostgres)

# Load backend modules
source("backend/R/database/db_connection.R")
source("backend/R/database/indicator_queries.R")
source("backend/R/services/indicator_service.R")

api_error_response <- function(e, res) {

  # Log the actual error in the R console
  message(
    "AgWaterDS API error: ",
    conditionMessage(e)
  )

  # Handle invalid user input
  if (inherits(e, "agwaterds_validation_error")) {

    res$status <- 400L

    return(
      list(
        status = "error",
        message = conditionMessage(e)
      )
    )
  }

  # Handle unexpected server/database errors
  res$status <- 500L

  return(
    list(
      status = "error",
      message = "An unexpected server error occurred."
    )
  )
}


# ==========================================
# HEALTH CHECK
# ==========================================

#* Check API health
#* @get /api/health
#* @serializer json
function() {

  list(
    status = "success",
    message = "AgWaterDS API is running"
  )
}


# ==========================================
# ADMINISTRATIVE UNITS
# ==========================================

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


# ==========================================
# EVAPOTRANSPIRATION
# ==========================================

#* Retrieve evapotranspiration observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* @get /api/evapotranspiration
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

  get_evapotranspiration_service(
    con, admin_id, start_date, end_date
  )
}


# ==========================================
# SOIL MOISTURE
# ==========================================

#* Retrieve soil moisture observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* @get /api/soil-moisture
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

  get_soil_moisture_service(
    con, admin_id, start_date, end_date
  )
}


# ==========================================
# WATER BALANCE
# ==========================================

#* Retrieve water balance observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* @get /api/water-balance
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

  get_water_balance_service(
    con, admin_id, start_date, end_date
  )
}


# ==========================================
# CROP WATER DEMAND
# ==========================================

#* Retrieve crop water demand observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* @get /api/crop-water-demand
#* @serializer json
function(admin_id = NULL, start_date = NULL, end_date = NULL) {

  con <- connect_db()
  on.exit(DBI::dbDisconnect(con), add = TRUE)

  get_crop_water_demand_service(
    con, admin_id, start_date, end_date
  )
}
