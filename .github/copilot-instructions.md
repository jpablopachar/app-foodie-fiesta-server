# Copilot instructions

These instructions apply to `app-foodie-fiesta-server`, the Express backend for Foodie Fiesta.

## Commands

Run these from the backend directory:

- `npm run dev` — start `src/index.js` with nodemon.
- `npm start` — start `src/index.js` with Node.
- `npx eslint .` — lint the backend; `npx eslint src/controllers/order.js` targets one file.
- `npx prettier --check src` — check formatting; `npx prettier --write src/controllers/order.js` formats one file.

There is no build script or configured test framework. `npm test` is a placeholder that exits with an error, and there is no single-test command.

## Architecture

The backend uses Express 5 and Mongoose 9 with native ES modules (`"type": "module"`). The code is organized by responsibility under `src/`: `configs/` configures MongoDB and Cloudinary, `models/` defines user/product/order schemas, `controllers/` implements cart, product, user, and order operations, `middlewares/` handles user/admin authentication and uploads, and `routes/` is intended to expose those operations. `src/index.js` and the route files are currently empty, so application startup and route wiring are not yet implemented.

Order creation supports cash on delivery and Stripe checkout; Stripe uses `pkr`, adds a fixed delivery charge, and its client is initialized when `controllers/order.js` is imported. Load environment variables before importing that controller.

## Repository conventions and integration details

- Use the existing Prettier settings: no semicolons, single quotes, two-space indentation, and ES5 trailing commas. ESLint uses the flat config in `eslint.config.mjs`.
- User JWTs are read from the `token` request header. `authUser` verifies the token and places the decoded ID in `req.body.userId`, which the user controllers consume. Admin authentication uses `ADMIN_EMAIL` and `ADMIN_PASS` from the environment rather than a database admin record.
- Product image uploads use Multer disk storage and Cloudinary. The order controller calculates Stripe line items from product size prices and applies the existing delivery charge and currency conversion.
- Mongoose models use the `models.<name> || model(...)` pattern to avoid recompilation errors.
- The codebase is ESM, so relative imports need `.js` extensions. Check actual exports before using barrel files: several existing barrels use extensionless paths or do not match the named/default exports of their modules.
- Runtime configuration is supplied through environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASS`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `STRIPE_SECRET_KEY`. Do not add secret values to source control.
- Existing comments and much of the domain language are in Spanish; preserve that language when editing adjacent code.

`CLAUDE.md` contains additional backend-specific context and should be kept consistent when these commands or architectural details change.