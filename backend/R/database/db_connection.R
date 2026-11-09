
library(DBI)
library(RPostgres)

connect_db <- function() {

  con <- dbConnect(
    RPostgres::Postgres(),
    dbname   = Sys.getenv("AGWATERDS_DB_NAME"),
    host     = Sys.getenv("AGWATERDS_DB_HOST"),
    port     = as.integer(Sys.getenv("AGWATERDS_DB_PORT")),
    user     = Sys.getenv("AGWATERDS_DB_USER"),
    password = Sys.getenv("AGWATERDS_DB_PASSWORD")
  )

  return(con)
}
