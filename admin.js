const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./User");
const Order = require("./Order");
const Alteration = require("./Alteration");
const CFG = require("./config");
const { auth, allowRoles } = require("./auth");
const router = express.Router();
router.use(auth, allowRoles("admin"));

const validEmail = (email) => typeof email === "string" && /^\S+@\S+\.\S+$/.test(email.trim());
const validSpecialties = (specialties) =>
  Array.isArray(specialties) && specialties.length > 0 &&
  specialties.every((specialty) => CFG.categories.includes(specialty));

router.get("/stats", async (req, res) => {
  const [agg] = await Order.aggregate([
    { $match: { status: { $nin: ["cancelled", "declined"] } } },
    { $group: { _id: null, orders: { $sum: 1 }, orderValue: { $sum: "$totalAmount" }, commission: { $sum: "$platformFee" }, deliveryFees: { $sum: "$deliveryCharge" } } }]);
  const [delivered, altOrders, openClaims, pendingTailors] = await Promise.all([
    Order.countDocuments({ status: "delivered" }), Alteration.distinct("order"),
    Alteration.countDocuments({ status: { $in: ["requested", "escalated"] } }),
    User.countDocuments({ role: "tailor", approved: false })]);
  res.json({ orders: 0, orderValue: 0, commission: 0, deliveryFees: 0, ...agg, _id: undefined,
    alterationRate: delivered ? Math.round(100 * altOrders.length / delivered) : 0, openClaims, pendingTailors });
});

router.get("/tailors", async (req, res) => {
  const f = { role: "tailor" };
  if (req.query.approved === "false") f.approved = false;
  res.json(await User.find(f).select("name email phone area specialties approved accepting offersPickup rateMultiplier capacity rating").sort({ createdAt: -1 }).limit(100));
});

router.post("/tailors", async (req, res) => {
  const b = req.body || {};
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (typeof b.name !== "string" || !b.name.trim() || !validEmail(email) ||
      typeof b.password !== "string" || b.password.length < 8 || !validSpecialties(b.specialties))
    return res.status(400).json({ message: "Name, valid email, password of 8+ characters and specialties are required" });
  try {
    const tailor = await User.create({
      name: b.name.trim(), email, password: await bcrypt.hash(b.password, 12), role: "tailor",
      phone: String(b.phone || "").slice(0, 20), area: String(b.area || "").slice(0, 80),
      specialties: b.specialties, approved: true
    });
    res.status(201).json({ _id: tailor._id, name: tailor.name, email: tailor.email, approved: tailor.approved });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
    if (err.name === "ValidationError") return res.status(400).json({ message: "Invalid tailor details" });
    console.error("Could not create tailor:", err);
    res.status(500).json({ message: "Could not create tailor" });
  }
});

router.patch("/tailors/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
  const b = req.body || {}, update = {};
  if (b.name !== undefined) {
    if (typeof b.name !== "string" || !b.name.trim()) return res.status(400).json({ message: "Name is required" });
    update.name = b.name.trim();
  }
  if (b.email !== undefined) {
    if (!validEmail(b.email)) return res.status(400).json({ message: "Valid email is required" });
    update.email = b.email.trim().toLowerCase();
  }
  if (b.phone !== undefined) update.phone = String(b.phone).slice(0, 20);
  if (b.area !== undefined) update.area = String(b.area).slice(0, 80);
  if (b.specialties !== undefined) {
    if (!validSpecialties(b.specialties)) return res.status(400).json({ message: "Choose at least one valid specialty" });
    update.specialties = b.specialties;
  }
  for (const key of ["approved", "accepting", "offersPickup"]) {
    if (b[key] !== undefined) {
      if (typeof b[key] !== "boolean") return res.status(400).json({ message: `Invalid ${key} value` });
      update[key] = b[key];
    }
  }
  if (b.rateMultiplier !== undefined) update.rateMultiplier = b.rateMultiplier;
  if (b.capacity !== undefined) update.capacity = b.capacity;
  try {
    const tailor = await User.findOneAndUpdate({ _id: req.params.id, role: "tailor" }, update,
      { new: true, runValidators: true }).select("name email phone area specialties approved accepting offersPickup rateMultiplier capacity");
    tailor ? res.json(tailor) : res.status(404).json({ message: "Tailor not found" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
    if (err.name === "ValidationError" || err.name === "CastError") return res.status(400).json({ message: "Invalid tailor details" });
    console.error("Could not update tailor:", err);
    res.status(500).json({ message: "Could not update tailor" });
  }
});

router.delete("/tailors/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
  try {
    const tailor = await User.findOneAndUpdate({ _id: req.params.id, role: "tailor" },
      { approved: false, accepting: false }, { new: true }).select("name email approved accepting");
    tailor ? res.json(tailor) : res.status(404).json({ message: "Tailor not found" });
  } catch (err) {
    console.error("Could not remove tailor:", err);
    res.status(500).json({ message: "Could not remove tailor" });
  }
});

router.patch("/tailors/:id/approve", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
  const t = await User.findOneAndUpdate({ _id: req.params.id, role: "tailor" },
    { approved: req.body?.approved !== false }, { new: true }).select("name email area approved");
  t ? res.json(t) : res.status(404).json({ message: "Tailor not found" });
});
module.exports = router;
