# AgWaterDS REST API Documentation

## 1. Overview

AgWaterDS provides REST API endpoints developed using R and Plumber. The API retrieves geospatial administrative information and water-related indicators from a PostgreSQL/PostGIS database.

**Base URL (local development):** `http://127.0.0.1:8000`

## 2. Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/admin-units` | Retrieve administrative units |
| GET | `/api/evapotranspiration` | Retrieve evapotranspiration observations |
| GET | `/api/soil-moisture` | Retrieve soil moisture observations |
| GET | `/api/water-balance` | Retrieve water balance observations |
| GET | `/api/crop-water-demand` | Retrieve crop water demand observations |

## 3. Query Parameters

Indicator endpoints support the following optional parameters:

| Parameter | Type | Description |
|---|---|---|
| `admin_id` | String | Filter by administrative unit ID |
| `start_date` | Date | Beginning of observation period (`YYYY-MM-DD`) |
| `end_date` | Date | End of observation period (`YYYY-MM-DD`) |

Example:

`/api/evapotranspiration?admin_id=NG001&start_date=2025-01-01&end_date=2025-12-01`

## 4. HTTP Status Codes

| Code | Description |
|---|---|
| 200 | Request successful |
| 400 | Invalid request parameters |
| 500 | Unexpected server error |

## 5. Development Notes

The current indicator records are synthetic test data used for API and software development. They should not be interpreted as scientifically validated environmental observations.