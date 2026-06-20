# Proposal: Change User Password Endpoint

## Intent
Enable authenticated users to change their password securely from the application API, ensuring account protection and credential updates.

## Scope

### In Scope
- Create service function `updateUserPassword(id, newPassword)` to hash and update user passwords.
- Implement validation schema and validation helper `validateChangePassword(body)` to assert presence of `currentPassword` and length constraints (minimum 6 characters) on `newPassword`.
- Implement controller function `changePassword(req, res, next)` to handle requests, verify current credentials using `bcrypt.compare`, trigger update, and manage localized error responses.
- Register `PUT /change-password` route under `/api/auth` secured by `requireAuth`.
- Define localized error messages in Spanish and English for invalid new password, incorrect current password, and invalid input data.
- Develop unit tests validating correct responses (200, 400, 401) and database updates.

### Out of Scope
- Password recovery/reset flows for non-authenticated users (forgot password flows via email).
- Automating session logout across all devices upon password change (invalidation of all active refresh tokens).

## Capabilities

### New Capabilities
- `user-auth-change-password`: Manage password updates securely for authenticated sessions.

### Modified Capabilities
- None.

## Approach
Expose a new `PUT /api/auth/change-password` route. When triggered:
1. The route parses authorization token using `requireAuth`.
2. Controller validates input payload parameters.
3. Controller retrieves full user record (including hashed password) by `req.user.id` from DB.
4. Controller compares `currentPassword` with user's hashed password via `bcrypt.compare`.
5. If matches, calls `userService.updateUserPassword` to hash `newPassword` and persist it to PostgreSQL.
6. Returns `200 OK` on success.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/services/user.service.js` | Modified | Add `updateUserPassword(id, newPassword)` helper. |
| `src/validations/auth.validation.js` | Modified | Add `validateChangePassword(body)` validation function. |
| `src/controllers/auth.controller.js` | Modified | Add `changePassword(req, res, next)` controller. |
| `src/routes/auth.routes.js` | Modified | Map `PUT /change-password` endpoint. |
| `src/utils/errors.i18n.js` | Modified | Define `INVALID_CURRENT_PASSWORD` and `PASSWORD_MIN_LENGTH` error keys. |
| `src/locales/errors/es.json` & `en.json` | Modified | Add translations for validation and credential check errors. |
| `tests/auth.controller.test.js` | Modified | Add test cases for password change validation and execution. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Modifying another user's password | Low | Retrieve target `userId` strictly from `req.user.id` (populated by verified JWT) rather than allowing it in request params or body. |
| Weak hashing in update | Low | Reuse the same hashing algorithm (bcrypt with salt rounds = 10) configured during user registration. |

## Rollback Plan
Revert code changes using Git checkout. No database schema changes are introduced, so database rollback/migrations are not required.

## Dependencies
- None.

## Success Criteria
- [ ] `PUT /api/auth/change-password` returns `200 OK` with success message when valid credentials are provided.
- [ ] `PUT /api/auth/change-password` returns `401 Unauthorized` with localized error when `currentPassword` is incorrect.
- [ ] `PUT /api/auth/change-password` returns `400 Bad Request` with localized error details when `newPassword` is shorter than 6 characters.
- [ ] User can log in successfully with the new password after update.
- [ ] All unit and integration tests run and pass successfully.
