# Tasks: US 6 - Environment Variables and CORS

## Phase 1: Foundation & Dependencies

- [x] 1.1 Add `cors` dependency to `package.json` and install locally and inside Docker.
- [x] 1.2 Update `.env.example` to include `PORT`, `DATABASE_URL`, and `FRONTEND_URL`.
- [x] 1.3 Update `docker-compose.yml` to forward `FRONTEND_URL` to the `app` container.

## Phase 2: Core Implementation

- [x] 2.1 Update `src/index.js` to load `dotenv/config` at startup.
- [x] 2.2 Register the `cors` middleware in `src/app.js` configured with `process.env.FRONTEND_URL` and exposed header `X-Total-Count`.

## Phase 3: Manual Verification

- [x] 3.1 Verify environment variables load on container startup by checking server initialization.
- [x] 3.2 Verify CORS permits requests from `FRONTEND_URL` (send requests with Origin header matching `FRONTEND_URL` and check `Access-Control-Allow-Origin`).
- [x] 3.3 Verify CORS blocks/excludes requests from unauthorized origins.
