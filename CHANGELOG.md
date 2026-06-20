# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0](https://github.com/gonzalomolina-void/tpexpress/compare/v1.1.3...v1.5.0) (2026-06-20)


### Features

* **about:** add About API configuration ([12d15cf](https://github.com/gonzalomolina-void/tpexpress/commit/12d15cf6fe1c967b7e36267485ce83d2fcd9d750))
* **about:** add language parameter to About API query ([a6d2fb4](https://github.com/gonzalomolina-void/tpexpress/commit/a6d2fb4b636e2a709d5f150724b6358843b49903))
* **about:** update API URL to use baseUrl variable ([78469df](https://github.com/gonzalomolina-void/tpexpress/commit/78469df20c3515ca06cfed356e489a17caed7a0e))
* **auth:** implement endpoint to change user password ([2795a92](https://github.com/gonzalomolina-void/tpexpress/commit/2795a92f515e70b2a24cfd3d91b2c5bc717054cd))
* **db:** add interactive user update utility script ([9893749](https://github.com/gonzalomolina-void/tpexpress/commit/9893749866194943f17df29e55478b1f9a5317c1))
* **health:** localize application description in health endpoint response ([39ff56f](https://github.com/gonzalomolina-void/tpexpress/commit/39ff56fc16bc1c6e7f76a4af4cf0bef712536024))
* implement user profile model and API endpoints ([6a261f9](https://github.com/gonzalomolina-void/tpexpress/commit/6a261f990e078ae4e8b962eb2f42cdc14ca2445f))
* **search:** extend card search to match name or description ([13cc310](https://github.com/gonzalomolina-void/tpexpress/commit/13cc3105079da82e57be564d0147da0c78fc5577))
* **security:** implement HTTP status code adjustments for user registration and favorites management ([5c543a4](https://github.com/gonzalomolina-void/tpexpress/commit/5c543a4b8cd575b9194ae7a92d3ee49240fbce7b))

### [1.1.3](https://github.com/gonzalomolina-void/tpexpress/compare/v1.1.2...v1.1.3) (2026-06-17)


### Features

* **health:** add database check and favicon ([3ae3b0a](https://github.com/gonzalomolina-void/tpexpress/commit/3ae3b0a3424151a63047c658a94e9c8c857ffaae))

### [1.1.2](https://github.com/gonzalomolina-void/tpexpress/compare/v1.1.1...v1.1.2) (2026-06-17)


### Bug Fixes

* **deploy:** allow swagger.json in vercel build ([2d9d766](https://github.com/gonzalomolina-void/tpexpress/commit/2d9d7668dbb1064487f0562ac619fa54776d34c7))

### [1.1.1](https://github.com/gonzalomolina-void/tpexpress/compare/v1.1.0...v1.1.1) (2026-06-17)


### Bug Fixes

* **deploy:** configure node 22 and resolve pnpm build placeholders ([ed43591](https://github.com/gonzalomolina-void/tpexpress/commit/ed43591d590666f6111d1909892ddce308dfb473))

## [1.1.0](https://github.com/gonzalomolina-void/tpexpress/compare/v1.0.1...v1.1.0) (2026-06-16)


### Features

* **api:** implementar US 20 - API de Consulta Dinámica de Tipos y Rarezas ([2492f26](https://github.com/gonzalomolina-void/tpexpress/commit/2492f26d7f0ac1630c7a797dd52a69aa72f43c60))
* **auth:** add name field validation and persistence to backend ([7cab865](https://github.com/gonzalomolina-void/tpexpress/commit/7cab865ce74a804faafea8303ee040db976e600b))
* **card:** add endpoint for card edit without flattening ([245525e](https://github.com/gonzalomolina-void/tpexpress/commit/245525e0b499e77a97038e714b2e12a0655c386a))
* **cards:** secure read endpoints with requireAuth (US15) ([1d05351](https://github.com/gonzalomolina-void/tpexpress/commit/1d053514befab6b6516cff3eef9a01f87b91848a))
* **ci:** US 18 - Implementar versionado semántico automático y publicación de releases ([1c3f89d](https://github.com/gonzalomolina-void/tpexpress/commit/1c3f89d81a35bd95ece0dab90ce10429872cd814))
* **deployment:** add .vercelignore and document release tag strategy ([79da039](https://github.com/gonzalomolina-void/tpexpress/commit/79da039a65eed8d1149b2188869caf96caff5abb))
* **deployment:** add Vercel serverless configuration and deployment guide ([bb41f50](https://github.com/gonzalomolina-void/tpexpress/commit/bb41f5030f70cfac29c51a8edf56f92ed4fb36b7))
* **health:** enriquecer endpoint de salud con metadatos de package.json ([b9d75b8](https://github.com/gonzalomolina-void/tpexpress/commit/b9d75b860d6467bb04bb17d4c1c0869ac354abc0))


### Bug Fixes

* **bruno:** corregir autenticacion en peticiones bruno y test de integracion ([8bb5d37](https://github.com/gonzalomolina-void/tpexpress/commit/8bb5d3763f6419acb8ef3c970c49d88e3699703c))

### 1.0.1 (2026-06-12)


### Features

* **about:** add about team endpoint and integration test script ([7b8e005](https://github.com/gonzalomolina-void/tpexpress/commit/7b8e005944b281d9b1ac7958c3a6669b22e1e0b6))
* add packageManager field to package.json ([945f5fb](https://github.com/gonzalomolina-void/tpexpress/commit/945f5fb3ba51fb3517fbc46c3b77199a3b524930))
* add Swagger documentation and integrate swagger-ui-express for API documentation ([fedd9eb](https://github.com/gonzalomolina-void/tpexpress/commit/fedd9ebd40aa64024622d93133b40e137ae0008f))
* **api:** add user authentication endpoints and API testing collection with Bruno ([7cb3fbb](https://github.com/gonzalomolina-void/tpexpress/commit/7cb3fbb225ec25bd1752e5614fa46f9db60b2e13))
* **auth:** implement role-based authorization and improve test-api script ([2ad2347](https://github.com/gonzalomolina-void/tpexpress/commit/2ad23477daba79dc06970fc7dab919da0f35507b))
* **auth:** implement session persistence using refresh tokens ([bc4b547](https://github.com/gonzalomolina-void/tpexpress/commit/bc4b547e32f9d97c02c75dc008a39873a188d2aa))
* **auth:** implement user registration, login, and jwt authentication middleware ([512472a](https://github.com/gonzalomolina-void/tpexpress/commit/512472a793a309f655f132f6a6a508c9787b9c26))
* **auth:** implement user roles and update authentication flow ([d46e10a](https://github.com/gonzalomolina-void/tpexpress/commit/d46e10a769bf9f43b7e71de62f1dbb905a176fce))
* **cards:** add search, type, and rarity filters to card retrieval API ([503ea44](https://github.com/gonzalomolina-void/tpexpress/commit/503ea449fadebcce3c7405d0c93b68414d41b9ed))
* **cards:** agregar soporte de busqueda y filtros en el catalogo ([3def69a](https://github.com/gonzalomolina-void/tpexpress/commit/3def69ab89079dd93fe78c0350b50028e3a80cf7))
* **db:** implement database seeding from characters.json ([74dbcb4](https://github.com/gonzalomolina-void/tpexpress/commit/74dbcb45b5b36fff43728d0ed356340bf8af2ffa))
* **docker:** add powershell runner script with optional debug mode ([461b612](https://github.com/gonzalomolina-void/tpexpress/commit/461b612541e9db37a6561b9c2fded2b548ca61d6))
* **docs:** add deployment considerations for Vercel serverless functions ([ba5aeb6](https://github.com/gonzalomolina-void/tpexpress/commit/ba5aeb6aa9f8ce30be30136d65ed5d0dc909913a))
* **dx:** add docker debugging configuration and update workflow documentation ([521e56f](https://github.com/gonzalomolina-void/tpexpress/commit/521e56f5c40feb2da56130f57c46ffbd798da0b5))
* **favorites:** implement user favorites feature US 12 ([92e4e79](https://github.com/gonzalomolina-void/tpexpress/commit/92e4e791ef32527fa8c1fd4c79afc2115c8d8f1a))
* implement card management endpoints with internationalization and pagination support ([f1ff2f4](https://github.com/gonzalomolina-void/tpexpress/commit/f1ff2f4ce5688b706c59dd3d0c0c1ac4c8d8bb3f))
* implement environment variables and CORS configuration ([edbbe50](https://github.com/gonzalomolina-void/tpexpress/commit/edbbe50a9450a43c84892d14d39b138d6ac51e9c))
* initialize Prisma setup with PostgreSQL schema and migrations ([7d2b2a8](https://github.com/gonzalomolina-void/tpexpress/commit/7d2b2a81fc7ef2806adf6692da319e935a991964))
* initialize project with pnpm, express and setup health check ([95488c6](https://github.com/gonzalomolina-void/tpexpress/commit/95488c660f07e593a43f5a35fb1fb47ffdffea8a))
* refactor card data structure to use translations array and update validation logic ([38a8222](https://github.com/gonzalomolina-void/tpexpress/commit/38a8222ccfddec04df68e78dd7b12f1148b16120))
* **test:** add CORS and i18n cases to API integration test script ([4709493](https://github.com/gonzalomolina-void/tpexpress/commit/4709493dedf261479e4e34f592ef373de371d728))
* **test:** enhance API integration tests with CORS and i18n validations ([c331d3e](https://github.com/gonzalomolina-void/tpexpress/commit/c331d3eec26ceaf8a6bf36607fd5e4fc6dbf55a4))
* **tools:** make New-Release.ps1 parameterizable for direct code copying ([cf90e3d](https://github.com/gonzalomolina-void/tpexpress/commit/cf90e3d9acb37dcb8d30daeeae21c497b9bbf333))
* **us5:** implement card write endpoints with manual validation ([da609df](https://github.com/gonzalomolina-void/tpexpress/commit/da609df7ef75e128c37a9ebb25a652dc6413bc66))


### Bug Fixes

* **.gitignore:** remove New-Release.ps1 from ignored files ([96bc65f](https://github.com/gonzalomolina-void/tpexpress/commit/96bc65f8ef1176f438538b16c4f23efd8d1a78e3))
* correct contributor links in README.md ([45371e3](https://github.com/gonzalomolina-void/tpexpress/commit/45371e33b7171823c971670717091dccb9bc4c7f))
* remove unnecessary newline before export in app.js ([46976d4](https://github.com/gonzalomolina-void/tpexpress/commit/46976d41bdc528cd109bea3b78eb5a04b050f534))
