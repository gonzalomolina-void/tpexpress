# Tasks: Change User Password Endpoint

## Phase 1: Validations & Localization (Infrastructure)
- [x] 1.1 Add `CURRENT_PASSWORD_REQUIRED`, `NEW_PASSWORD_REQUIRED`, and `INVALID_CURRENT_PASSWORD` keys to `ERROR_KEYS` in `src/utils/errors.i18n.js`.
- [x] 1.2 Add corresponding translation messages to `src/locales/errors/es.json`.
- [x] 1.3 Add corresponding translation messages to `src/locales/errors/en.json`.
- [x] 1.4 Implement `validateChangePassword(body)` in `src/validations/auth.validation.js`.

## Phase 2: DB Services (Core)
- [x] 2.1 Implement `updateUserPassword(id, newPassword)` in `src/services/user.service.js`.

## Phase 3: Controller & Routing (Wiring)
- [x] 3.1 Implement `changePassword(req, res, next)` controller in `src/controllers/auth.controller.js`.
- [x] 3.2 Add `PUT /change-password` route in `src/routes/auth.routes.js` using `requireAuth`.

## Phase 4: Verification (Testing)
- [x] 4.1 Implement unit tests in `tests/auth.controller.test.js` validating the validation logic and successful update.
- [x] 4.2 Add integration test cases in `Test-Api.ps1` to verify successful password changes, wrong current password responses (401), and short new password validation responses (400).
- [x] 4.3 Verify all tests pass with `pnpm test`.
- [x] 4.4 Verify integration tests pass using `Test-Api.ps1` in PowerShell 7.
- [x] 4.5 Verify code style compliance with `pnpm run lint`.
- [x] 4.6 Create Bruno request files for Change Password and update Get Me request sequence in bruno collection.
