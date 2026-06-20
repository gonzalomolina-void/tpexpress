## Exploration: Implement Profile Model and /api/profile endpoint

### Current State
Currently, user settings like `darkMode` and `language` are stored only on the client side (e.g. `localStorage` in the browser). If a user logs in from a different device, their preferences are lost. The system does not have a profile database table or profile management APIs.

### Affected Areas
- `prisma/schema.prisma` — Create `Profile` model (1-to-1 with `User`) and configure deletion cascade.
- `prisma/seed.js` — Update the seed file to generate default profiles for test users.
- `src/services/user.service.js` — Update `createUser` to automatically create a default profile on registration using nested writes.
- `src/services/profile.service.js` (new) — Implement methods to retrieve and update user profiles.
- `src/controllers/profile.controller.js` (new) — Implement endpoints `GET /api/profile` and `PUT /api/profile` with appropriate validations and translations.
- `src/routes/profile.routes.js` (new) — Map routing for the profile endpoints, secured by `requireAuth`.
- `src/app.js` — Mount `/api/profile` route.
- `src/utils/errors.i18n.js` / `src/locales/errors/` — Introduce new error key constants for invalid language options, missing parameters, etc.

### Approaches
1. **Option 1: Dedicated Profile Service (Recommended)**
   - Create a separate `src/services/profile.service.js` to manage all database interactions for the `Profile` model.
   - **Pros**: Follows SRP (Single Responsibility Principle) and keeps `user.service.js` clean and modular.
   - **Cons**: Minor overhead of creating a new file.
   - **Effort**: Low.

2. **Option 2: Extend User Service**
   - Place all profile retrieval and updating logic inside `src/services/user.service.js`.
   - **Pros**: Fewer service files in the codebase.
   - **Cons**: Monolithic service file, coupling user account credentials/auth logic with unrelated display preferences.
   - **Effort**: Low.

### Recommendation
We recommend **Option 1 (Dedicated Profile Service)**. It is cleaner, aligns with our project structure (where distinct domains like Favorite, Card, Rarity, and Type have their own service files), and ensures modular testing.
We also recommend utilizing Prisma's nested writes in `user.service.js` (`profile: { create: {} }`) during `createUser` to guarantee that every new user has a profile generated automatically.

### Risks
- **Database Migration**: Running migrations on production requires the table creation. Since every existing user must have a profile, we should handle this during migration or run a migration script (or update the seed script for dev).
- **Validation**: Language configurations must be restricted to valid options (e.g., `'es'`, `'en'`).

### Ready for Proposal
Yes. The orchestrator is ready to present this exploration report to the user and request confirmation to write the Proposal.
