# Repository Guidelines

## Project Structure & Module Organization

This repository is the Express backend for Foodie Fiesta and uses native ES modules. Application code lives in `src/`: routes receive requests, controllers handle HTTP concerns, services contain business logic, repositories isolate Mongoose access, and models define schemas. Shared setup is under `src/configs/` and request middleware under `src/middlewares/`. Keep each folder's `index.js` barrel updated when adding modules.

Tests live in `test/unit/` and `test/integration/`, mirroring the source area they cover. Vitest discovers files matching `test/**/*.test.js`. Generated coverage reports are written to `coverage/` and must not be committed.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts `src/index.js` with nodemon for local development.
- `npm start` runs the API with Node; the default port is `4000`.
- `npm test` runs the complete Vitest suite once.
- `npm run test:watch` reruns tests while files change.
- `npm run test:coverage` generates text and HTML coverage reports.
- `npx eslint .` checks JavaScript quality; `npx prettier --check .` verifies formatting.

There is no compilation or build step.

## Coding Style & Naming Conventions

Follow `.prettierrc`: two-space indentation, single quotes, no semicolons, ES5 trailing commas, and an 80-character line width. ESLint uses the flat configuration in `eslint.config.mjs`. Use explicit `.js` extensions in relative imports. Name domain files with lowercase nouns (`product.js`, `order.js`) and export named layer objects such as `productService` or `orderRepository`. Preserve Spanish wording when editing adjacent comments and tests.

## Testing Guidelines

Use Vitest for unit tests and Supertest for HTTP integration tests. Place tests beside the matching layer path, for example `test/unit/services/cart.test.js`. Mock external services and repositories in unit tests; integration tests should exercise routes and response contracts. No minimum coverage threshold is configured, but new behavior and bug fixes should include focused tests.

## Commit & Pull Request Guidelines

Recent commits use short Spanish descriptions such as `Agregar pruebas de integración...` or `Se agrega vitest...`. Keep commits focused and describe the observable change. Pull requests should summarize behavior, list verification commands, link related issues, and document API or environment-variable changes. Include sample requests or responses when endpoint contracts change.

## Security & Configuration

Never commit `.env` or credentials. Define environment access only in `src/configs/env.js`; required keys include MongoDB, JWT, admin, Cloudinary, and Stripe settings. Use sanitized values in logs, tests, and review notes.
