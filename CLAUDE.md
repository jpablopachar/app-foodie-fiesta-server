# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — run with nodemon (`src/index.js`)
- `npm start` — run with node
- `npx eslint .` / `npx prettier --write .` — lint / format (flat config in `eslint.config.mjs`; Prettier: no semicolons, single quotes, 2 spaces, es5 trailing commas)
- No test framework is configured (`npm test` is a placeholder).

## Architecture

Express 5 + Mongoose 9 REST backend (ESM, `"type": "module"`) for the Foodie Fiesta food-ordering app (MERN). Code and comments are in Spanish; API response messages are mixed Spanish/English.

Layout under `src/`: `configs/` (MongoDB, Cloudinary), `models/` (order, product, user), `controllers/` (cart, order, product, user), `middlewares/` (auth, auth-admin, multer), `routes/`.

Required env vars: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASS`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `STRIPE_SECRET_KEY` (loaded via `dotenv`; no `.env.example` exists).

### Conventions that span files

- **Response style**: handlers always reply HTTP 200 with `{ success: boolean, message | data }`, including on errors; they use try/catch and `console.log(error)`.
- **User auth**: JWT is sent in a `token` request header (not `Authorization: Bearer`). `authUser` verifies it and injects `req.body.userId`, which controllers then read from the body.
- **Admin auth**: there is no admin user record. `adminLogin` signs the string `ADMIN_EMAIL + ADMIN_PASS` as the JWT payload, and `authAdmin` checks the decoded payload equals that string.
- **File uploads**: Multer uses disk storage (original filename); product images are then uploaded to Cloudinary.
- **Orders**: `placeOrder` (COD) and `placeOrderStripe` + `verifyStripe` (Stripe checkout; currency `pkr`, flat delivery charge of 10). Order `date` is a `Number` timestamp; `status` defaults to `'Order Placed'`.
- **Models**: defined with `models.x || model('x', schema)` to avoid recompilation errors.

## Current state / pitfalls

The project is mid-scaffolding. Check these before assuming things work:

- `src/index.js` is empty and the `src/routes/*.js` files are empty/untracked — the Express app, middleware wiring (`cors`, `express.json`), route mounting, and `dotenv` loading still have to be written.
- Barrel files (`index.js`) use `export { default as ... }` / `export *`, and import paths lack `.js` extensions, which Node ESM does not resolve. Also, `controllers/*.js` use **named** exports while `controllers/index.js` re-exports `default`; `middlewares/index.js` points at `./admin-auth` (the file is `auth-admin.js`); `configs/index.js` uses `export *` on modules that only have default exports; and `jsonwebtoken` is imported as a named `{ verify }`/`{ sign }` (it's CommonJS). Fix these (add `.js` extensions, align export styles) when wiring things up.
- `controllers/order.js` instantiates `Stripe` at import time, so `STRIPE_SECRET_KEY` must be set before it loads (i.e. `dotenv` must be configured first).
