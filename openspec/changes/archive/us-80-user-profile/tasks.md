# Tasks: Implement Profile Model and /api/profile endpoint

## Phase 1: Database & Schema (Infrastructure)
- [x] 1.1 Update `prisma/schema.prisma` to add `Profile` model related 1-to-1 to `User`.
- [x] 1.2 Generate Prisma migration: `pnpm prisma migrate dev --name add_profile_model`.
- [x] 1.3 Update `prisma/seed.js` to seed default profile records for all test users.

## Phase 2: Core Services (Implementation)
- [x] 2.1 Create unit tests `tests/profile.service.test.js` for profile retrieval and update DB actions.
- [x] 2.2 Create `src/services/profile.service.js` implementing DB select and update calls.
- [x] 2.3 Modify `src/services/user.service.js` to nested-create `profile` during `createUser()`.

## Phase 3: Routes & Controllers (Wiring)
- [x] 3.1 Create unit tests `tests/profile.controller.test.js` to validate endpoint responses and input parsing.
- [x] 3.2 Create `src/controllers/profile.controller.js` validating input parameters and translating errors.
- [x] 3.3 Create `src/routes/profile.routes.js` mounting GET and PUT `/api/profile` secured by `requireAuth`.
- [x] 3.4 Register router in `src/app.js` under `/api`.
- [x] 3.5 Modify `src/controllers/auth.controller.js` to include the nested `profile` in login/getMe responses.

## Phase 4: Localization & Integration (Testing)
- [x] 4.1 Update `src/utils/errors.i18n.js` and locale JSONs with keys for invalid language/darkMode.
- [ ] 4.2 Add test cases in `Test-Api.ps1` to verify profile retrieval, validation (400), and login payloads.
- [ ] 4.3 Run `pnpm test` and `Test-Api.ps1` to verify all tests pass.
