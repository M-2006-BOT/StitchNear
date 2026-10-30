# StitchNear: tailoring platform

Customers design a garment, compare nearby tailors (price, rating, specialty, availability, ready date),
order with home pickup and delivery, track every stage and request fit-guarantee alterations.
Tailors manage orders and availability. Admins approve tailors, add designs and resolve fit claims.

## Run locally

Requirements: Node.js 18 or newer and a MongoDB database (local or MongoDB Atlas).

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
   - PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
3. Edit `.env`. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` of at least 8 characters. Do not share or commit `.env`.
4. Run `npm run seed` to create/update the configured admin and add sample designs and demo tailors. Use this only with a development database; the command prints a generated demo tailor password once.
5. Start the server with `npm start` and open http://localhost:5000.

The project includes `package-lock.json`; use `npm ci` instead of `npm install` when you need a clean install from the exact locked dependency versions.

## Push to GitHub

The `.gitignore` excludes `node_modules`, local `.env` files, logs, and generated output. The safe-to-share `.env.example` is intentionally included.

Before your first push:

1. Create an empty repository on GitHub.
2. From this project folder, run `git init` if this folder is not already a Git repository.
3. Run `git status --short` and confirm `.env` and `node_modules` are not listed. Do not force-add ignored secret files.
4. Stage and commit the project: `git add .` then `git commit -m "Prepare StitchNear project"`.
5. Connect your GitHub repository and push:

   ```sh
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

Replace the example remote with your repository URL. If this folder has already been initialized or has a remote, inspect `git status` and `git remote -v` before changing anything.

The admin dashboard can add, edit, archive, and restore designs; create, edit, approve, and remove tailors from the marketplace. Removing a design or tailor keeps existing order records intact.
The server serves the front end from the project root, so there is no CORS setup and no hardcoded API URL.

## Customer account
Customer accounts include saved delivery addresses, size and style preferences, wishlist items, communication preferences, profile and password updates, order history, and downloadable HTML invoices. Checkout remains cash on delivery; payment cards and wallets are not collected or stored. Custom-made orders use the 7-day fit-guarantee alteration flow rather than standard change-of-mind returns. Email and SMS preference delivery requires a notification provider, which is not configured.

Tailors can maintain garment listings on their own profile with prices and delivery estimates. Customers can message approved tailors and attach compressed JPEG photos; message threads and photos are stored in MongoDB. User settings support system/light/dark themes and English, Hindi, Tamil, Telugu, and Malayalam. Public customer/tailor sign-up is available; admin accounts are provisioned with the seed command and configured admin credentials.

During checkout, customers choose a cloth color and whether the customer or tailor supplies the fabric. Tailor-supplied fabric includes the selected material surcharge; customer-supplied fabric does not. Customers may attach a compressed cloth photo to the order, and customers/tailors can exchange additional cloth photos in their private app messages.

## Where the rules live
- `config.js`: delivery fees, pickup fee, commission, fabric surcharges, fit window and tolerance.
- `pricing.js`: the only place prices and completion dates are calculated (server side).
- `orders.js`: order creation and the status state machine. `alterations.js`: fit guarantee.

## Before real customers
- Payments are cash on delivery only. Add a payment provider and webhook before taking cards.
- Use HTTPS, set `NODE_ENV=production`, and keep `JWT_SECRET` and all real credentials out of Git.
- Replace demo tailor coordinates (in `seed.js`) with real ones; tailors set their own from the dashboard.
- Add email or SMS notifications for status changes, and move the token to an httpOnly cookie if you need longer sessions.
