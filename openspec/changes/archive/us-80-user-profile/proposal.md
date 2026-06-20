# Proposal: Implement Profile Model and /api/profile endpoint

## Intent
Allow users to persist display settings (`darkMode`, `language`) on the server so preferences are consistent across different sessions and devices.

## Scope

### In Scope
- Define a 1-to-1 `Profile` schema related to `User`.
- Run database migrations for PostgreSQL.
- Automatically create profiles on user registration.
- Build `GET /api/profile` to retrieve authenticated user preferences.
- Build `PUT /api/profile` to update preferences (validated `darkMode` as boolean, `language` as "es"|"en").
- Include `profile` in `GET /api/auth/me` and `POST /api/auth/login` responses.

### Out of Scope
- Syncing preferences dynamically via WebSockets.
- Supporting additional preferences in this cycle.

## Capabilities

### New Capabilities
- `user-profile`: Manage user display preferences (darkMode and language).

### Modified Capabilities
- `user-auth-refresh-tokens`: Include the user's profile (`profile: { darkMode, language }`) in registration, login, and `/api/auth/me` responses.

## Approach
Create a dedicated `Profile` service, controller, and router. Establish a 1-to-1 relationship in Prisma. Update `userService.createUser` to create a default profile using Prisma nested writes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add `Profile` model and relate to `User`. |
| `prisma/seed.js` | Modified | Seed default profiles for test users. |
| `src/services/user.service.js` | Modified | Auto-create profile in `createUser`. |
| `src/services/profile.service.js` | New | Fetch and update profiles. |
| `src/controllers/profile.controller.js` | New | Endpoints for profile. |
| `src/routes/profile.routes.js` | New | Define paths for profile. |
| `src/app.js` | Modified | Register profile routes. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing profiles for existing users | High | Update seed script for dev; write a migration strategy or database default fallback if deploying. |

## Rollback Plan
Revert code changes via Git and rollback database using a Prisma migration down-script if necessary, or simply drop the `profiles` table.

## Dependencies
- None.

## Success Criteria
- [ ] Database contains `profiles` table linked 1-to-1 with `users`.
- [ ] All test users seed successfully with default profiles.
- [ ] `GET /api/profile` returns `200 OK` with profile object for authenticated user.
- [ ] `PUT /api/profile` successfully updates `darkMode` and `language` with input validation.
- [ ] Login and `/api/auth/me` return user object containing `profile`.
