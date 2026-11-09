
# ==========================================
# AgWaterDS REST API
# ==========================================

library(plumber)
library(DBI)
library(RPostgres)

# Load backend modules

project_root <- normalizePath(
  Sys.getenv("AGWATERDS_PROJECT_ROOT"),
  winslash = "/",
  mustWork = TRUE
)

source(file.path(project_root, "backend/R/database/db_connection.R"))
source(file.path(project_root, "backend/R/database/indicator_queries.R"))
source(file.path(project_root, "backend/R/services/indicator_service.R"))

source(file.path(
  project_root,
  "backend/R/processing/spatial_processing.R"
))

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
#* Get all administrative units
#* @get /api/admin-units
function(res) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    query <- "
      SELECT
        admin_id,
        admin_name,
        country_name,
        country_code,
        area_sqkm,
        center_lat,
        center_lon
      FROM admin_units
      ORDER BY admin_name
    "

    DBI::dbGetQuery(con, query)

  }, error = function(e) {
    api_error_response(e, res)
  })
}


# ==========================================
# EVAPOTRANSPIRATION
# ==========================================

#* Retrieve evapotranspiration observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* Get evapotranspiration data
#* @get /api/evapotranspiration
function(res, admin_id = NULL, start_date = NULL, end_date = NULL) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    get_evapotranspiration_service(
      con,
      admin_id,
      start_date,
      end_date
    )

  }, error = function(e) {
    api_error_response(e, res)
  })
}

# ==========================================
# SOIL MOISTURE
# ==========================================

#* Retrieve soil moisture observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* Get soil moisture data
#* @get /api/soil-moisture
function(res, admin_id = NULL, start_date = NULL, end_date = NULL) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    get_soil_moisture_service(
      con,
      admin_id,
      start_date,
      end_date
    )

  }, error = function(e) {
    api_error_response(e, res)
  })
}

# ==========================================
# WATER BALANCE
# ==========================================

#* Retrieve water balance observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* Get water balance data
#* @get /api/water-balance
function(res, admin_id = NULL, start_date = NULL, end_date = NULL) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    get_water_balance_service(
      con,
      admin_id,
      start_date,
      end_date
    )

  }, error = function(e) {
    api_error_response(e, res)
  })
}


# ==========================================
# CROP WATER DEMAND
# ==========================================

#* Retrieve crop water demand observations
#* @param admin_id Administrative unit ID
#* @param start_date Start date (YYYY-MM-DD)
#* @param end_date End date (YYYY-MM-DD)
#* Get crop water demand data
#* @get /api/crop-water-demand
function(res, admin_id = NULL, start_date = NULL, end_date = NULL) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    get_crop_water_demand_service(
      con,
      admin_id,
      start_date,
      end_date
    )

  }, error = function(e) {
    api_error_response(e, res)
  })
}


# ==========================================
# SPATIAL API - ADMINISTRATIVE BOUNDARIES
# ==========================================

#* Retrieve administrative boundaries as GeoJSON
#* @get /api/map/admin-units
#* @serializer contentType list(type="application/geo+json")
function(res) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    admin_geojson <- get_admin_boundaries(con)

    return(admin_geojson)

  }, error = function(e) {

    api_error_response(e, res)

  })
}

# ==========================================
# SPATIAL API - INDICATOR MAP
# ==========================================

#* Retrieve indicator map data as GeoJSON
#* @param indicator Indicator name
#* @param date Observation date (YYYY-MM-DD)
#* @param admin_id Optional administrative unit ID
#* @param metric Required for water_balance
#* @get /api/map/indicator
#* @serializer contentType list(type="application/geo+json")
function(res,
         indicator,
         date,
         admin_id = NULL,
         metric = NULL) {

  tryCatch({

    con <- connect_db()
    on.exit(DBI::dbDisconnect(con), add = TRUE)

    # Generate indicator GeoJSON
    indicator_geojson <- get_indicator_map(
      con = con,
      indicator = indicator,
      observation_date = date,
      admin_id = admin_id,
      metric = metric
    )

    return(indicator_geojson)

  }, error = function(e) {

    api_error_response(e, res)

  })
}