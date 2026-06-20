# Design: Implement Profile Model and /api/profile endpoint

## Technical Approach
Establish a 1-to-1 relationship between `User` and `Profile` using Prisma. Encapsulate CRUD operations in a dedicated `ProfileService`, configure validations in `ProfileController`, and secure endpoints using the existing `requireAuth` middleware.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Service location | Extended `UserService` vs Dedicated `ProfileService` | Dedicated `ProfileService` to keep domains separate (SRP). |
| Profile creation | Lazy creation on fetch vs Nested write on registration | Nested write `profile: { create: {} }` on `User.create` to ensure DB integrity. |

## Data Flow
```
Client ──(JWT Token + Body)──→ Router ──(requireAuth)──→ Controller ──→ Service ──→ Prisma DB (Profiles)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `Profile` model and `User.profile` relation. |
| `prisma/seed.js` | Modify | Seed default profiles for test users on db seed. |
| `src/services/user.service.js` | Modify | Update `createUser` to nested-create `profile`. |
| `src/services/profile.service.js` | Create | Handle DB select and update calls. |
| `src/controllers/profile.controller.js` | Create | Controller endpoints with validation and error translations. |
| `src/routes/profile.routes.js` | Create | Map endpoints `GET` and `PUT` /api/profile. |
| `src/app.js` | Modify | Register profile routes. |
| `src/controllers/auth.controller.js` | Modify | Include nested profile in login and `getMe` responses. |
| `src/utils/errors.i18n.js` | Modify | Add error keys: `INVALID_LANGUAGE` and `INVALID_DARK_MODE`. |
| `src/locales/errors/es.json` & `en.json` | Modify | Add error message translations. |

## Interfaces / Contracts

### GET /api/profile Response:
```json
{
  "id": 1,
  "userId": 2,
  "darkMode": false,
  "language": "es"
}
```

### PUT /api/profile Payload:
```json
{
  "darkMode": true,
  "language": "en"
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Profile retrieval and updates in Service | Vitest database-mocked queries. |
| Unit | Form validation and i18n error handling in Controller | Vitest mocked req/res calls. |
| Integration | Endpoints security (401) and success flows | `Test-Api.ps1` requests. |

## Migration / Rollout
Run `pnpm prisma migrate dev --name add_profile_model`. The migration creates the `profiles` table. The updated `seed.js` script backfills test users during seeding.
