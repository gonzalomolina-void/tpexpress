# Proposal: US 6 - Environment Variables and CORS

## Intent
Manage project environment variables securely and restrict API access to the approved React frontend origin using CORS middleware, preventing unauthorized cross-origin requests.

## Scope

### In Scope
- Install the `cors` package.
- Load env variables dynamically from `.env` in local development.
- Add CORS middleware to Express (`src/app.js`) matching `process.env.FRONTEND_URL`.
- Forward `FRONTEND_URL` environment variable from the host to the `app` container in `docker-compose.yml`.
- Declare `DATABASE_URL`, `PORT`, and `FRONTEND_URL` in `.env.example`.

### Out of Scope
- Implementing client-side CORS handling (frontend).
- Setting up production-specific secrets/hosting configurations.

## Capabilities

### New Capabilities
- `env-cors-config`: Secure configuration and dynamic CORS origin validation based on the `FRONTEND_URL` variable.

### Modified Capabilities
None

## Approach
We will add `cors` npm package, load env variables in `src/index.js` using `dotenv/config`, register the CORS middleware dynamically in `src/app.js`, and update `docker-compose.yml` to pass `FRONTEND_URL` to the app.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add `cors` as a runtime dependency. |
| `docker-compose.yml` | Modified | Pass `FRONTEND_URL` from the host to the container. |
| `src/app.js` | Modified | Inject CORS middleware configured with `FRONTEND_URL`. |
| `src/index.js` | Modified | Import `dotenv/config` to load env variables. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Frontend requests blocked by CORS in dev | Low | Add a fallback default of `http://localhost:5173` if `FRONTEND_URL` is undefined. |

## Rollback Plan
Remove `cors` from `src/app.js` and `package.json`, and revert changes in `docker-compose.yml` and `src/index.js`.

## Dependencies
None.

## Success Criteria
- [ ] CORS is enabled on all endpoints.
- [ ] Requests from origin matching `FRONTEND_URL` are permitted.
- [ ] Requests from other origins are blocked.
- [ ] `FRONTEND_URL`, `PORT`, and `DATABASE_URL` are successfully defined in `.env.example`.
