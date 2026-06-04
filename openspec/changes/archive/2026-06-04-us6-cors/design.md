# Design: US 6 - Environment Variables and CORS

## Technical Approach
We will install the community-standard `cors` package.
At startup, `src/index.js` will import `dotenv/config` to populate `process.env` with values from the local `.env` file.
In `src/app.js`, we will register the `cors` middleware, configured with the origin from `process.env.FRONTEND_URL` (falling back to `http://localhost:5173` in development) and exposing the `X-Total-Count` header for pagination.
We will also update `docker-compose.yml` to pass the `FRONTEND_URL` environment variable into the app container.

## Architecture Decisions

### Decision: Environment Variable Loading Entry Point
**Choice**: Import `dotenv/config` in `src/index.js`.
**Alternatives considered**: Loading in `src/app.js` or relying strictly on Docker compose injection.
**Rationale**: Placing it at the very top of the entry point `src/index.js` guarantees that environment variables are available globally for all imported modules (including database configs and route controllers) during the initialization phase, even when running outside of Docker.

### Decision: CORS Middleware Implementation
**Choice**: Use the standard `cors` middleware package configured with origin and exposed headers.
**Alternatives considered**: Writing custom Express middleware to manually set headers.
**Rationale**: The `cors` package is robust, handles options preflight requests (`OPTIONS` method) automatically, and simplifies configuration for credentials and exposed headers like `X-Total-Count`.

## Data Flow
Clients send requests to the API. The CORS middleware intercept requests before hitting routes to validate origin headers.

```
Client (origin: FRONTEND_URL) 
   │
   ├── [Request with Origin Header] ──→ Express Server
   │                                         │
   │                                  [CORS Middleware]
   │                                    - Check origin matches FRONTEND_URL
   │                                    - Expose X-Total-Count
   │                                         │
   ├─ [Allowed origin] ──────────────────────┼───→ Controllers/Routes
   │                                         │
   └─ [Blocked origin / Options preflight] ──┴───→ Return CORS response/headers
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `cors` as a runtime dependency. |
| `docker-compose.yml` | Modify | Forward `FRONTEND_URL` to the app container environment block. |
| `src/index.js` | Modify | Import `dotenv/config` at the top of the entry point. |
| `src/app.js` | Modify | Register `cors` middleware with configuration. |

## Interfaces / Contracts

The CORS configuration object will be:
```javascript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200,
  exposedHeaders: ['X-Total-Count']
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual Verification | Verify CORS header | Use curl to send requests with and without the `Origin` header and check the `Access-Control-Allow-Origin` and `Access-Control-Expose-Headers` headers in the response. |

## Migration / Rollout
No database migration is required. Ensure developers copy the new `.env.example` settings to their local `.env` files.
