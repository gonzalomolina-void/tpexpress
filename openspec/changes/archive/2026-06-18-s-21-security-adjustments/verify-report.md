# Verification Report: US 21 - Ajustes de Seguridad y Códigos de Estado HTTP

## Verification Status: COMPLETE (Backend & Frontend Verified)

All backend and frontend tasks and specifications have been implemented, tested, and verified successfully.

## Results by Specification

### 1. User Authentication (`POST /api/auth/register` & Signup Form)
- **Backend Requirement**: Return `409 Conflict` when registering with a duplicate email.
- **Backend Implementation**: Handled in `src/controllers/auth.controller.js` by checking if the user already exists.
- **Backend Verification**: Unit tests updated and verified passing in `tests/auth.controller.test.js`.
- **Frontend Requirement**: Catch `409` and display "El email ya está registrado" dynamically.
- **Frontend Implementation**: Handled in `src/pages/Login.jsx` (inside `register` catch block).
- **Frontend Verification**: Unit test added and verified passing in `src/pages/Login.test.jsx`.

### 2. Favorites Addition (`POST /api/favorites` & Favorites Manager)
- **Backend Requirement**: Return `409 Conflict` when adding a duplicate favorite.
- **Backend Implementation**: Select-before-insert check using `getFavorite` helper.
- **Backend Verification**: Unit tests updated and verified passing in `tests/favorite.controller.test.js`.
- **Frontend Requirement**: Keep UI sync intact on `409 Conflict` (avoid rolling back local state since the favorite is already in the database).
- **Frontend Implementation**: Conditional rollback exception in `src/services/favoritesService.js`.
- **Frontend Verification**: Unit test added and verified passing in `src/services/favoritesService.test.js`.

### 3. Favorites Deletion (`DELETE /api/favorites/:id` & Favorites Manager)
- **Backend Requirement**: Return `404 Not Found` when trying to delete a favorite that does not exist.
- **Backend Implementation**: Handled in `src/controllers/favorite.controller.js`.
- **Backend Verification**: Unit tests updated and verified passing in `tests/favorite.controller.test.js`.
- **Frontend Requirement**: Keep UI sync intact on `404 Not Found` (avoid rolling back local state since the favorite is already deleted from the database).
- **Frontend Implementation**: Conditional rollback exception in `src/services/favoritesService.js`.
- **Frontend Verification**: Unit test added and verified passing in `src/services/favoritesService.test.js`.

## Test Execution Details

### Backend
- **Test Command**: `pnpm test`
- **Output Summary**:
  - Test Files: 10 passed
  - Tests: 60 passed
  - Duration: ~1.04s

### Frontend
- **Test Command**: `pnpm test:run`
- **Output Summary**:
  - Test Files: 37 passed
  - Tests: 310 passed
  - Duration: ~14.23s

## Final State
All requirements met. The change is ready to be archived.
