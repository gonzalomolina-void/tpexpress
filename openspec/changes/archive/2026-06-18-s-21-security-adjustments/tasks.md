# Tasks: US 21 - Ajustes de Seguridad y Códigos de Estado HTTP

## Phase 1: Foundation & Services

- [x] 1.1 Add `getFavorite(userId, cardId)` helper to `src/services/favorite.service.js` to retrieve a single favorite record.

## Phase 2: Core Controllers (Backend)

- [x] 2.1 Modify `register` controller in `src/controllers/auth.controller.js` to return status `409 Conflict` when email already exists.
- [x] 2.2 Modify `addFavorite` controller in `src/controllers/favorite.controller.js` to check if favorite exists using the helper and return `409 Conflict`.
- [x] 2.3 Modify `removeFavorite` controller in `src/controllers/favorite.controller.js` to inspect the return value and return `404 Not Found` if it is null.

## Phase 3: Testing & Verification (Backend)

- [x] 3.1 Update tests in `tests/auth.controller.test.js` to expect status `409` on duplicate email registration.
- [x] 3.2 Update tests in `tests/favorite.controller.test.js` to expect status `409` on duplicate favorite addition.
- [x] 3.3 Update tests in `tests/favorite.controller.test.js` to expect status `404` on deleting a non-existent favorite.
- [x] 3.4 Run `pnpm test` and verify all tests pass.

## Phase 4: Frontend Integration & Documentation

- [x] 4.1 Update React registration form page to intercept `409` errors and display "El email ya está registrado" dynamically.
- [x] 4.2 Update React favorites logic to handle `409` and `404` error codes from the backend API.
- [x] 4.3 Update `docs/swagger.json` to include response specifications for `409` and `404` on the modified endpoints.
