library(sf)
library(geojsonsf)

get_admin_boundaries <- function(con) {

  admin_sf <- sf::st_read(
    con,
    query = "
      SELECT
        admin_id,
        admin_name,
        country_name,
        country_code,
        area_sqkm,
        center_lat,
        center_lon,
        geom
      FROM admin_units
      ORDER BY admin_name
    ",
    quiet = TRUE
  )

  # Convert spatial data to GeoJSON
  admin_geojson <- geojsonsf::sf_geojson(admin_sf)

  return(admin_geojson)
}

get_indicator_map <- function(
    con,
    indicator,
    observation_date,
    admin_id = NULL,
    metric = NULL
) {

  # Define allowed indicators and their database fields
  indicator_config <- list(

    evapotranspiration = list(
      table = "evapotranspiration",
      value = "mean_et"
    ),

    soil_moisture = list(
      table = "soil_moisture",
      value = "mean_soil_moisture"
    ),

    crop_water_demand = list(
      table = "crop_water_demand",
      value = "water_demand"
    )
  )

  # Handle water balance separately because it has three metrics
  if (identical(indicator, "water_balance")) {

    allowed_metrics <- c(
      "water_supply",
      "water_demand",
      "water_deficit"
    )

    if (is.null(metric) || !metric %in% allowed_metrics) {
      stop("For water_balance, select water_supply, water_demand, or water_deficit.")
    }

    table_name <- "water_balance"
    value_column <- metric

  } else {

    if (is.null(indicator_config[[indicator]])) {
      stop("Unsupported indicator.")
    }

    table_name <- indicator_config[[indicator]]$table
    value_column <- indicator_config[[indicator]]$value
  }

  # Validate the observation date
  observation_date <- validate_date(
    observation_date,
    "observation_date"
  )

  if (is.null(observation_date)) {
    stop("An observation_date is required.")
  }

  # Build the SQL query using the selected, whitelisted fields
  date_sql <- as.character(
    DBI::dbQuoteString(con, as.character(observation_date))
  )

  query <- paste0(
    "
    SELECT
      a.admin_id,
      a.admin_name,
      a.country_name,
      a.country_code,
      i.observation_date,
      i.", value_column, " AS indicator_value,
      i.unit,
      i.data_source,
      a.geom

    FROM admin_units a

    LEFT JOIN ", table_name, " i
      ON a.admin_id = i.admin_id
      AND i.observation_date = ", date_sql
  )

  # Optional administrative-unit filter
  if (!is.null(admin_id) && nzchar(admin_id)) {

    validate_admin_id(admin_id)

    admin_id_sql <- as.character(
      DBI::dbQuoteString(con, admin_id)
    )

    query <- paste0(
      query,
      " WHERE a.admin_id = ",
      admin_id_sql
    )
  }

  query <- paste0(query, " ORDER BY a.admin_name")

  # Retrieve spatial data
  indicator_sf <- sf::st_read(
    con,
    query = query,
    quiet = TRUE
  )

  # Add data availability indicator
  indicator_sf$data_available <- !is.na(
  indicator_sf$indicator_value
)

  # Debug: inspect the new property
  print(
    indicator_sf[
      c("admin_id", "indicator_value", "data_available")
    ]
  )

  # Convert spatial data to GeoJSON
  return(
    geojsonsf::sf_geojson(indicator_sf)
  )

}