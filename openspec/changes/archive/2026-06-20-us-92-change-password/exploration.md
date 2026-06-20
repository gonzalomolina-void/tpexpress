## Exploration: Change User Password Endpoint

### Current State
Currently, users can log in, register, and refresh tokens. However, once registered, there is no way for an authenticated user to change their password. Password updates or resets are not implemented in the services, controllers, or routing layers.

### Affected Areas
- `src/services/user.service.js` — Add a new function `updateUserPassword` to handle password hashing and updating in the DB.
- `src/validations/auth.validation.js` — Add validation function `validateChangePassword` to check `currentPassword` presence and `newPassword` constraints (minimum 6 characters).
- `src/controllers/auth.controller.js` — Implement controller `changePassword` that validates input, verifies `currentPassword` matches using `bcrypt`, updates the DB, and maps localized errors.
- `src/routes/auth.routes.js` — Add `PUT /change-password` secured by the `requireAuth` middleware.
- `src/utils/errors.i18n.js` / `src/locales/errors/` — Introduce new error key constants for password mismatches and length constraints.
- `tests/auth.controller.test.js` — Implement unit tests for the password change endpoint (success and error paths).
- `tests/auth.validation.test.js` (or inline in controllers test) — Test the new validations.

### Approaches
1. **Option 1: In-Controller Processing (Direct DB Update)**
   - Process everything inside the controller using Prisma directly or retrieve and save inside `auth.controller.js`.
   - **Pros**: Quick implementation.
   - **Cons**: Violates separation of concerns. Hashing and DB logic should belong to the service layer.
   - **Effort**: Low.

2. **Option 2: Service-Encapsulated Update (Recommended)**
   - Expose `updateUserPassword(id, newPassword)` in `user.service.js`. The service takes care of salt generation, hashing, and database writing.
   - **Pros**: Clean separation of concerns, keeps the controller focused on request/response handling and translation, and allows reuse of password-updating logic.
   - **Cons**: Minor overhead of adding another service function.
   - **Effort**: Low.

### Recommendation
We recommend **Option 2 (Service-Encapsulated Update)**. The service layer should encapsulate password hashing and database persistence, matching the architectural pattern established in `user.service.js` for registration.

### Risks
- **Plain-text Comparison**: The validation must compare the supplied `currentPassword` against the retrieved database hash via `bcrypt.compare` (not plain-text comparison).
- **Session invalidation / Token refresh**: When a password changes, we should decide whether existing refresh tokens are invalidated. The scope only requests changing the password, but we must make sure the JWT is not immediately invalidated unless desired.
- **Validating same password**: Optionally, we might want to check if the new password is the same as the current password, but the issue description does not require it.

### Ready for Proposal
Yes. The orchestrator is ready to present this exploration report to the user and request confirmation to write the Proposal.
