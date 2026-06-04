# Environment Variables and CORS Specification

## Purpose
Define how the application loads environment variables and restricts access to approved client origins using CORS.

## Requirements

### Requirement: Environment Variable Configuration
The application MUST load environment variables from a `.env` file in local development.
The application MUST declare standard configuration variables in `.env.example`, including:
- `PORT`: The port the backend server listens on.
- `DATABASE_URL`: Connection string for the PostgreSQL database.
- `FRONTEND_URL`: The origin URL of the client frontend application.

#### Scenario: Environment variables loading on startup
- GIVEN a valid `.env` file exists with `PORT`, `DATABASE_URL`, and `FRONTEND_URL`
- WHEN the application starts
- THEN the variables MUST be available under `process.env`

### Requirement: CORS Origin Restriction
The application MUST configure CORS middleware to allow cross-origin requests ONLY from the origin defined in `FRONTEND_URL`.
If `FRONTEND_URL` is not defined, the application SHOULD fall back to `http://localhost:5173` in development environments.
The application MUST expose HTTP response headers needed for pagination (like `x-total-count`) and translation to the React frontend.

#### Scenario: Requests from allowed origin
- GIVEN a request is sent from the client at the origin defined in `FRONTEND_URL`
- WHEN the server processes the request
- THEN the response MUST contain `Access-Control-Allow-Origin` matching `FRONTEND_URL`
- AND the response status MUST be the corresponding HTTP code (e.g., 200)

#### Scenario: Requests from disallowed origin
- GIVEN a request is sent from a client origin not matching `FRONTEND_URL`
- WHEN the server processes the request
- THEN the response MUST NOT contain `Access-Control-Allow-Origin` matching the request's origin (or the request MUST be rejected by CORS)
