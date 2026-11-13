
# ==========================================
# AgWaterDS Authentication Service
# ==========================================

library(DBI)
library(sodium)


# ------------------------------------------
# Validation helper
# ------------------------------------------

auth_error <- function(message) {
  stop(
    structure(
      list(message = message),
      class = c("agwaterds_auth_error", "error", "condition")
    )
  )
}


# ------------------------------------------
# Normalize email
# ------------------------------------------

normalize_email <- function(email) {

  if (is.null(email) || length(email) != 1 || is.na(email)) {
    auth_error("A valid email address is required.")
  }

  email <- tolower(trimws(as.character(email)))

  if (
    !nzchar(email) ||
    nchar(email) > 255 ||
    !grepl("^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$", email)
  ) {
    auth_error("Please provide a valid email address.")
  }

  email
}


# ------------------------------------------
# Password validation
# ------------------------------------------

validate_password <- function(password) {

  if (
    is.null(password) ||
    length(password) != 1 ||
    is.na(password)
  ) {
    auth_error("A password is required.")
  }

  password <- as.character(password)

  if (nchar(password, type = "chars") < 12) {
    auth_error("Password must contain at least 12 characters.")
  }

  if (nchar(password, type = "bytes") > 1024) {
    auth_error("Password is too long.")
  }

  invisible(TRUE)
}


# ------------------------------------------
# Generate session token
# ------------------------------------------

generate_session_token <- function() {

  # Generate 32 cryptographically secure random bytes
  token_bytes <- sodium::random(32)

  # Convert to hexadecimal representation
  sodium::bin2hex(token_bytes)
}


# ------------------------------------------
# Hash session token
# ------------------------------------------

hash_session_token <- function(token) {

  token_hash <- sodium::hash(
    buf = charToRaw(token),
    size = 32
  )

  sodium::bin2hex(token_hash)
}


# ==========================================
# USER REGISTRATION
# ==========================================

register_user <- function(
    con,
    full_name,
    email,
    password
) {

  full_name <- trimws(as.character(full_name))

  if (
    length(full_name) != 1 ||
    is.na(full_name) ||
    !nzchar(full_name) ||
    nchar(full_name) > 150
  ) {
    auth_error("Please provide a valid full name.")
  }

  email <- normalize_email(email)

  validate_password(password)

  # Public registration always receives researcher role.
  # Admin privileges must never be selected by the client.
  role <- DBI::dbGetQuery(
    con,
    "SELECT role_id
     FROM public.roles
     WHERE role_name = 'researcher'"
  )

  if (nrow(role) != 1) {
    stop("Researcher role is not configured.")
  }

  # Hash password using sodium password hashing
  password_hash <- sodium::password_store(password)

  # Insert user using parameterized SQL
  user <- DBI::dbGetQuery(
    con,
    "
    INSERT INTO public.users (
      full_name,
      email,
      password_hash,
      role_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      user_id,
      full_name,
      email,
      is_active,
      created_at
    ",
    params = list(
      full_name,
      email,
      password_hash,
      role$role_id[[1]]
    )
  )

  user
}


# ==========================================
# USER LOGIN
# ==========================================

login_user <- function(
    con,
    email,
    password
) {

  email <- normalize_email(email)

  if (
    is.null(password) ||
    length(password) != 1 ||
    is.na(password)
  ) {
    auth_error("Invalid email or password.")
  }

  user <- DBI::dbGetQuery(
    con,
    "
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.password_hash,
      u.is_active,
      r.role_name
    FROM public.users u
    INNER JOIN public.roles r
      ON u.role_id = r.role_id
    WHERE u.email = $1
    LIMIT 1
    ",
    params = list(email)
  )

  # Generic error prevents disclosure of account existence.
  if (nrow(user) != 1) {
    auth_error("Invalid email or password.")
  }

  if (!isTRUE(user$is_active[[1]])) {
    auth_error("Invalid email or password.")
  }

  password_valid <- sodium::password_verify(
    user$password_hash[[1]],
    password
  )

  if (!isTRUE(password_valid)) {
    auth_error("Invalid email or password.")
  }

  # Generate a random session token
  session_token <- generate_session_token()

  # Store only its hash in PostgreSQL
  token_hash <- hash_session_token(session_token)

  # Session expires after 8 hours
  session <- DBI::dbGetQuery(
    con,
    "
    INSERT INTO public.user_sessions (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (
      $1,
      $2,
      NOW() + INTERVAL '8 hours'
    )
    RETURNING
      session_id,
      expires_at
    ",
    params = list(
      user$user_id[[1]],
      token_hash
    )
  )

  list(
    user = list(
      user_id = user$user_id[[1]],
      full_name = user$full_name[[1]],
      email = user$email[[1]],
      role = user$role_name[[1]]
    ),
    session = list(
      token = session_token,
      expires_at = session$expires_at[[1]]
    )
  )
}


# ==========================================
# VALIDATE SESSION
# ==========================================

validate_session <- function(con, token) {

  if (
    is.null(token) ||
    length(token) != 1 ||
    is.na(token) ||
    !grepl("^[a-f0-9]{64}$", token)
  ) {
    return(NULL)
  }

  token_hash <- hash_session_token(token)

  user <- DBI::dbGetQuery(
    con,
    "
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.is_active,
      r.role_name
    FROM public.user_sessions s
    INNER JOIN public.users u
      ON s.user_id = u.user_id
    INNER JOIN public.roles r
      ON u.role_id = r.role_id
    WHERE s.token_hash = $1
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
      AND u.is_active = TRUE
    LIMIT 1
    ",
    params = list(token_hash)
  )

  if (nrow(user) != 1) {
    return(NULL)
  }

  list(
    user_id = user$user_id[[1]],
    full_name = user$full_name[[1]],
    email = user$email[[1]],
    role = user$role_name[[1]]
  )
}


# ==========================================
# USER LOGOUT
# ==========================================

logout_user <- function(con, token) {

  if (
    is.null(token) ||
    length(token) != 1 ||
    is.na(token) ||
    !grepl("^[a-f0-9]{64}$", token)
  ) {
    return(FALSE)
  }

  token_hash <- hash_session_token(token)

  affected <- DBI::dbExecute(
    con,
    "
    UPDATE public.user_sessions
    SET revoked_at = NOW()
    WHERE token_hash = $1
      AND revoked_at IS NULL
    ",
    params = list(token_hash)
  )

  affected > 0
}
