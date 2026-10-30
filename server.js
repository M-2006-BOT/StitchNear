require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "https://fonts.googleapis.com"],
  fontSrc: ["https://fonts.gstatic.com"], imgSrc: ["'self'", "data:", "https:"], connectSrc: ["'self'"],
  objectSrc: ["'none'"], frameAncestors: ["'none'"],
  upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null } } }));
if (process.env.CLIENT_ORIGIN) app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "600kb" }));

const limit = (max, windowMs = 15 * 60 * 1000) => rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." } });
app.use("/api", limit(600));
app.use(["/api/auth/login", "/api/auth/register"], limit(20));

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "StitchNear API" }));
app.use("/api/auth", require("./auth_1"));
app.use("/api/designs", require("./designs"));
app.use("/api/tailors", require("./tailors"));
app.use("/api/conversations", require("./conversations"));
app.use("/api/orders", require("./orders"));
app.use("/api/alterations", require("./alterations"));
app.use("/api/admin", require("./admin"));
app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/style.css", (req, res) => res.sendFile(path.join(__dirname, "style.css")));
app.get("/app.js", (req, res) => res.sendFile(path.join(__dirname, "app.js")));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: "Server error" }); });

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error("Set MONGODB_URI and JWT_SECRET in .env");
  if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.model("User").syncIndexes();        // makes sure the 2dsphere index exists
  await Promise.all([
    mongoose.model("TailorListing").createIndexes(),
    mongoose.model("Conversation").createIndexes(),
    mongoose.model("Message").createIndexes()
  ]);
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`StitchNear running at http://localhost:${port}`));
}
start().catch((e) => { console.error("Startup failed:", e.message); process.exit(1); });
