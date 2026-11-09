
# ==========================================
# AgWaterDS - Indicator Database Queries
# ==========================================


# Execute SQL queries with or without parameters
execute_query <- function(con, sql, params = list()) {

  if (length(params) == 0) {
    return(DBI::dbGetQuery(con, sql))
  }

  return(DBI::dbGetQuery(
    con,
    sql,
    params = params
  ))
}


# Retrieve evapotranspiration observations
get_evapotranspiration <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

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
    SELECT admin_id, observation_date, mean_et, unit, data_source
    FROM public.evapotranspiration
  "

  if (length(conditions) > 0) {
    sql <- paste(sql, "WHERE", paste(conditions, collapse = " AND "))
  }

  sql <- paste(sql, "ORDER BY observation_date, admin_id")

  execute_query(con, sql, params)
}


# Retrieve soil moisture observations
get_soil_moisture <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

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
    SELECT admin_id, observation_date, mean_soil_moisture, unit, data_source
    FROM public.soil_moisture
  "

  if (length(conditions) > 0) {
    sql <- paste(sql, "WHERE", paste(conditions, collapse = " AND "))
  }

  sql <- paste(sql, "ORDER BY observation_date, admin_id")

  execute_query(con, sql, params)
}


# Retrieve water balance observations
get_water_balance <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

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

  execute_query(con, sql, params)
}


# Retrieve crop water demand observations
get_crop_water_demand <- function(
    con,
    admin_id = NULL,
    start_date = NULL,
    end_date = NULL
) {

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
    SELECT admin_id, observation_date, water_demand, unit, data_source
    FROM public.crop_water_demand
  "

  if (length(conditions) > 0) {
    sql <- paste(sql, "WHERE", paste(conditions, collapse = " AND "))
  }

  sql <- paste(sql, "ORDER BY observation_date, admin_id")

  execute_query(con, sql, params)
}
