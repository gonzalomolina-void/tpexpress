# Design: Change User Password Endpoint

## Technical Approach
Implement input validation for `currentPassword` and `newPassword` fields. In the controller layer, verify credentials using `bcrypt.compare` against the database record before using the user service layer to hash the new password and update the database row. Secure the endpoint using the existing JWT authentication middleware (`requireAuth`).

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Password Validation | Controller validation vs Shared helper | Implement `validateChangePassword` in `auth.validation.js` to align with registration/login validation patterns. |
| DB Update Flow | Direct Prisma update in controller vs UserService encapsulation | Dedicated function `updateUserPassword(id, newPassword)` in `user.service.js` to ensure password hashing and database updates stay encapsulated in the service layer. |

## Data Flow
```
Client ──(JWT + PUT Payload)──→ Router ──(requireAuth)──→ Controller ──→ Service ──→ DB (Update User)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/services/user.service.js` | Modify | Implement `updateUserPassword(id, newPassword)` function. |
| `src/validations/auth.validation.js` | Modify | Implement validation helper `validateChangePassword(body)`. |
| `src/controllers/auth.controller.js` | Modify | Implement controller handler `changePassword(req, res, next)`. |
| `src/routes/auth.routes.js` | Modify | Map `PUT /change-password` route. |
| `src/utils/errors.i18n.js` | Modify | Define `CURRENT_PASSWORD_REQUIRED`, `NEW_PASSWORD_REQUIRED`, and `INVALID_CURRENT_PASSWORD` error keys. |
| `src/locales/errors/es.json` | Modify | Map Spanish error messages. |
| `src/locales/errors/en.json` | Modify | Map English error messages. |
| `tests/auth.controller.test.js` | Modify | Write controller-level test cases for change password requests (200, 400, 401). |

## Interfaces / Contracts

### PUT /api/auth/change-password Payload:
```json
{
  "currentPassword": "myOldPassword123",
  "newPassword": "myNewPassword456"
}
```

### Response on Success (200 OK):
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### Response on Error - Invalid New Password Length (400 Bad Request):
```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "newPassword",
      "message": "La contraseña debe tener al menos 6 caracteres"
    }
  ]
}
```

### Response on Error - Incorrect Current Password (401 Unauthorized):
```json
{
  "error": "No autorizado",
  "message": "La contraseña actual es incorrecta"
}
```

## Testing Strategy
- **Unit Tests (`tests/auth.controller.test.js`)**:
  - Mock `userService.getUserById` and `userService.updateUserPassword`.
  - Verify that a request with valid inputs returns `200` and triggers the service update.
  - Verify that a request with incorrect current password returns `401 Unauthorized` and does not call service update.
  - Verify that a request with missing fields or short password returns `400 Bad Request`.
- **Integration Tests**:
  - Manually verify end-to-end flow using the Bruno collection.
  - Document/add requests in the Bruno collection for automation.

## Migration / Rollout
No database structure modifications are introduced. Deploying changes only requires application server restart.
