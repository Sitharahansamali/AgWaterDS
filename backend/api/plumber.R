
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
