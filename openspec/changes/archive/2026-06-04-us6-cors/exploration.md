## Exploration: US 6 - Variables de Entorno y CORS

### Current State
- The backend currently runs Node.js 22 inside a Docker container (or locally) using Express and Prisma.
- Environment variables like `PORT` and `DATABASE_URL` are defined in `.env` and injected into the Docker container via `docker-compose.yml`.
- There is no CORS middleware registered in `src/app.js`, meaning the backend does not allow cross-origin requests from the React frontend.
- There is no loading of `.env` files in Node.js for local execution outside of Docker (e.g., if running `node src/index.js` directly), because `dotenv` is installed as a devDependency but never imported in the application code.
- `FRONTEND_URL` is defined in `.env` and `.env.example` but is not forwarded to the `app` container in `docker-compose.yml`.

### Affected Areas
- `package.json` — Need to install `cors` as a dependency.
- `docker-compose.yml` — Need to forward `FRONTEND_URL` to the `app` container's environment.
- `src/app.js` — Need to import `cors` and register it as a middleware, restricting origins dynamically to `process.env.FRONTEND_URL`.
- `src/index.js` — Need to load environment variables using `dotenv/config` or ensure they are loaded at the entry point for non-docker environments.

### Approaches
1. **Express `cors` Middleware with environment fallback** — Install the standard `cors` middleware, import it in `src/app.js`, and configure it using `process.env.FRONTEND_URL`. If the variable is not defined, we can fall back to `http://localhost:5173` or throw an error.
   - Pros: Standard Express way, safe, easy to test.
   - Cons: Needs careful handling of env variable presence.
   - Effort: Low

### Recommendation
We should install the `cors` package, load environment variables using `dotenv` in `src/index.js`, and configure the CORS middleware in `src/app.js` to dynamically allow requests from `process.env.FRONTEND_URL`. We also need to update `docker-compose.yml` to pass the `FRONTEND_URL` from the host environment to the container.

### Risks
- If `FRONTEND_URL` is missing or configured incorrectly, the React frontend will get blocked by CORS. We should default to a sensible fallback (like `http://localhost:5173`) in development if `FRONTEND_URL` is not set.

### Ready for Proposal
Yes. The next phase is to write the formal proposal in `proposal.md`.
