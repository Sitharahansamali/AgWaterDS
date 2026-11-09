
# ==========================================
# AgWaterDS - Indicator Service Layer
# ==========================================

# Validate administrative unit ID
validate_admin_id <- function(admin_id) {

  if (is.null(admin_id) || !nzchar(admin_id)) {
    return(invisible(TRUE))
  }

  if (length(admin_id) != 1 || is.na(admin_id)) {
    stop("admin_id must contain exactly one value.")
  }

  if (!grepl("^NG[0-9]{3}$", admin_id)) {
    stop("Invalid administrative unit ID format.")
  }

  invisible(TRUE)
}


# Validate date inputs
validate_date <- function(date_value, parameter_name) {

  if (is.null(date_value) || !nzchar(date_value)) {
    return(NULL)
  }

  if (length(date_value) != 1 || is.na(date_value)) {
    stop(parameter_name, " must contain exactly one date.")
  }

  parsed_date <- tryCatch(
    as.Date(date_value, format = "%Y-%m-%d"),
    error = function(e) NA
  )

  if (is.na(parsed_date) ||
      format(parsed_date, "%Y-%m-%d") != date_value) {
    stop(parameter_name, " must use YYYY-MM-DD format.")
  }

  return(parsed_date)
}


# Validate indicator request filters
validate_indicator_filters <- function(
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

  validate_admin_id(admin_id)

  start_date <- validate_date(start_date, "start_date")
  end_date <- validate_date(end_date, "end_date")

  if (!is.null(start_date) &&
      !is.null(end_date) &&
      start_date > end_date) {
    stop("start_date cannot be later than end_date.")
  }

  invisible(TRUE)
}



# Retrieve evapotranspiration through service layer
get_evapotranspiration_service <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

  validate_indicator_filters(admin_id, start_date, end_date)

  get_evapotranspiration(
    con,
    admin_id,
    start_date,
    end_date
  )
}


# Retrieve soil moisture through service layer
get_soil_moisture_service <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

  validate_indicator_filters(admin_id, start_date, end_date)

  get_soil_moisture(
    con,
    admin_id,
    start_date,
    end_date
  )
}


# Retrieve water balance through service layer
get_water_balance_service <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

  validate_indicator_filters(admin_id, start_date, end_date)

  get_water_balance(
    con,
    admin_id,
    start_date,
    end_date
  )
}


# Retrieve crop water demand through service layer
get_crop_water_demand_service <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

  validate_indicator_filters(admin_id, start_date, end_date)

  get_crop_water_demand(
    con,
    admin_id,
    start_date,
    end_date
  )
}
