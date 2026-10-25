# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — run with nodemon (`src/index.js`)
- `npm start` — run with node
- `npx eslint .` / `npx prettier --write .` — lint / format (flat config in `eslint.config.mjs`; Prettier: no semicolons, single quotes, 2 spaces, es5 trailing commas)
- No test framework is configured (`npm test` is a placeholder).

## Architecture

Express 5 + Mongoose 9 REST backend (ESM, `"type": "module"`) for the Foodie Fiesta food-ordering app (MERN). Code and comments are in Spanish; API response messages are mixed Spanish/English.

Layout under `src/`: `configs/` (env, MongoDB, Cloudinary), `models/` (order, product, user), `controllers/` (cart, order, product, user), `middlewares/` (auth, auth-admin, multer), `routes/` (one router per resource).

`src/index.js` creates the Express app (`express.json`, `cors`), mounts the routers at `/api/user`, `/api/product`, `/api/cart`, `/api/order`, then connects MongoDB and Cloudinary and listens on `env.port` (default 4000).

### Environment variables

`src/configs/env.js` is the **only** place that reads `process.env` (it imports `dotenv/config` and exports a frozen `env` object). Everywhere else import `{ env }` from it (`env.mongoUri`, `env.jwtSecret`, `env.adminEmail`, `env.adminPass`, `env.cloudinaryName`/`ApiKey`/`ApiSecret`, `env.stripeSecretKey`, `env.port`). To add or rename a variable, change only that file. The corresponding `.env` keys are `PORT`, `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASS`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `STRIPE_SECRET_KEY` (no `.env.example` exists).

### Conventions that span files

- **Response style**: handlers always reply HTTP 200 with `{ success: boolean, message | data }`, including on errors; they use try/catch and `console.log(error)`.
- **User auth**: JWT is sent in a `token` request header (not `Authorization: Bearer`). `authUser` verifies it and injects `req.body.userId`, which controllers then read from the body.
- **Admin auth**: there is no admin user record. `adminLogin` signs the string `ADMIN_EMAIL + ADMIN_PASS` as the JWT payload, and `authAdmin` checks the decoded payload equals that string.
- **File uploads**: Multer uses disk storage (original filename); product images are then uploaded to Cloudinary.
- **Orders**: `placeOrder` (COD) and `placeOrderStripe` + `verifyStripe` (Stripe checkout; currency `pkr`, flat delivery charge of 10). Order `date` is a `Number` timestamp; `status` defaults to `'Order Placed'`.
- **Models**: defined with `models.x || model('x', schema)` to avoid recompilation errors.

## Current state / pitfalls

- Routes: user (`/register`, `/login`, `/admin`), product (`/add` + `/remove` admin, `/single`, `/list` public), order (`/list`, `/status` admin; `/place`, `/stripe`, `/verifyStripe`, `/userOrders` user), cart (`/add`, `/update`, `/get`, all user). All are POST except product `/list` (GET).
- Node ESM needs explicit `.js` extensions and CommonJS packages must use default imports (`import jwt from 'jsonwebtoken'`, `import validator from 'validator'`, `mongoose.models`). Source files import each other directly with `.js`; **the barrel files are still broken and unused**: `models/index.js`, `controllers/index.js`, `middlewares/index.js` (points at `./admin-auth`, file is `auth-admin.js`) and `routes/index.js` lack `.js` extensions, and the controller barrel re-exports `default` while controllers use named exports. Import files directly, or fix the barrels first.
- `controllers/order.js` instantiates `Stripe` at import time; this works because importing `configs/env.js` loads `dotenv` first.
