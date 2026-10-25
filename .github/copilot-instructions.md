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

The backend uses Express 5 and Mongoose 9 with native ES modules (`"type": "module"`). The code is organized by responsibility under `src/`: `configs/` holds environment loading (`env.js`), MongoDB, and Cloudinary setup; `models/` defines user/product/order schemas; `controllers/` implements cart, product, user, and order operations; `middlewares/` handles user/admin authentication and uploads; and `routes/` defines one Express router per resource.

`src/index.js` creates the app (`express.json()`, `cors()`), mounts the routers at `/api/user`, `/api/product`, `/api/cart`, and `/api/order`, exposes a `GET /` health response, then awaits `connectDB()` and `connectCloudinary()` before listening on `env.port` (default 4000).

Route access is enforced per route in `src/routes/*.js`:

- `user`: `/register`, `/login`, `/admin` — public.
- `product`: `/add` (with `upload.single('image')`) and `/remove` — admin; `/single` and `GET /list` — public.
- `order`: `/list` and `/status` — admin; `/place`, `/stripe`, `/verifyStripe`, `/userOrders` — user.
- `cart`: `/add`, `/update`, `/get` — user.

All endpoints are `POST` except `GET /api/product/list`.

Order creation supports cash on delivery and Stripe checkout; Stripe uses `pkr`, adds a fixed delivery charge, and its client is created when `controllers/order.js` is imported. This works because that module imports `configs/env.js`, which loads `dotenv` first.

## Repository conventions and integration details

- Use the existing Prettier settings: no semicolons, single quotes, two-space indentation, and ES5 trailing commas. ESLint uses the flat config in `eslint.config.mjs`.
- User JWTs are read from the `token` request header. `authUser` verifies the token and places the decoded ID in `req.body.userId`, which the user controllers consume. Admin authentication uses `ADMIN_EMAIL` and `ADMIN_PASS` from the environment rather than a database admin record.
- Product image uploads use Multer disk storage and Cloudinary. The order controller calculates Stripe line items from product size prices and applies the existing delivery charge and currency conversion.
- Mongoose models use the `models.<name> || model(...)` pattern to avoid recompilation errors.
- Handlers respond with `{ success, message | data }` and catch errors with `console.log(error)`; most error paths still return HTTP 200 with `success: false` (product handlers use 500).
- The codebase is ESM: relative imports need explicit `.js` extensions, and CommonJS packages must be default-imported (`import jwt from 'jsonwebtoken'`, then `jwt.sign`/`jwt.verify`; `import validator from 'validator'`, then `validator.isEmail`).
- Import modules directly by file path. Only `configs/index.js` is a working barrel; `models/index.js`, `controllers/index.js`, `middlewares/index.js` (it points to `./admin-auth`, but the file is `auth-admin.js`), and `routes/index.js` use extensionless paths, and the controller barrel re-exports `default` although controllers use named exports. Fix a barrel before relying on it.
- `src/configs/env.js` is the only module that reads `process.env`. It imports `dotenv/config` and exports a frozen `env` object; everything else imports `{ env }` from it (`env.port`, `env.mongoUri`, `env.jwtSecret`, `env.adminEmail`, `env.adminPass`, `env.cloudinaryName`, `env.cloudinaryApiKey`, `env.cloudinaryApiSecret`, `env.stripeSecretKey`). Add or rename variables only there.
- The corresponding `.env` keys are `PORT`, `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASS`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `STRIPE_SECRET_KEY`. There is no `.env.example`, and secret values must not be added to source control.
- Existing comments and much of the domain language are in Spanish; preserve that language when editing adjacent code.

`CLAUDE.md` contains additional backend-specific context and should be kept consistent when these commands or architectural details change.