const express = require("express");
const mongoose = require("mongoose");
const Alteration = require("./Alteration");
const Order = require("./Order");
const CFG = require("./config");
const { auth, allowRoles } = require("./auth");
const router = express.Router();
const bad = (res, m, c = 400) => res.status(c).json({ message: m });
const OPEN = ["requested", "approved", "escalated"];

// Fit guarantee: customer reports a fit problem within 7 days of delivery.
router.post("/", auth, allowRoles("customer"), async (req, res) => {
  try {
    const { orderId, area, diffInches, note } = req.body || {};
    const diff = Number(diffInches);
    if (!mongoose.isValidObjectId(String(orderId)) || !Alteration.schema.path("area").enumValues.includes(area) ||
        !Number.isFinite(diff) || diff < 0 || diff > 20) return bad(res, "Invalid alteration details");
    const order = await Order.findOne({ _id: String(orderId), customer: req.user.id });
    if (!order || order.status !== "delivered") return bad(res, "Only delivered orders can be altered", 409);
    if (Date.now() - order.deliveredAt > CFG.fitWindowDays * 864e5) return bad(res, "The 7-day alteration window has ended", 409);
    if (await Alteration.exists({ order: order._id, status: { $in: OPEN } })) return bad(res, "An alteration is already open for this order", 409);
    const usedFreeRefit = await Alteration.exists({ order: order._id, covered: true, status: "completed" });
    const alt = await Alteration.create({
      order: order._id, customer: req.user.id, tailor: order.tailor, area, diffInches: diff,
      note: String(note || "").slice(0, 1000), covered: diff > CFG.tolerance && !usedFreeRefit });   // decided server-side
    res.status(201).json(alt);
  } catch { bad(res, "Could not create request", 500); }
});

router.get("/my", auth, async (req, res) => {
  const f = req.user.role === "customer" ? { customer: req.user.id } : req.user.role === "tailor" ? { tailor: req.user.id } : {};
  res.json(await Alteration.find(f).populate("order", "deliveryDate status").sort({ createdAt: -1 }).limit(100));
});

// action: approve | decline | complete
router.patch("/:id", auth, allowRoles("tailor", "admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid ID");
    const alt = await Alteration.findById(req.params.id);
    if (!alt) return bad(res, "Not found", 404);
    const admin = req.user.role === "admin";
    if (!admin && alt.tailor.toString() !== req.user.id) return bad(res, "Access denied", 403);
    const action = req.body?.action, reason = String(req.body?.reason || "").slice(0, 300);
    const open = admin ? ["requested", "escalated"] : ["requested"];
    if (action === "approve" && open.includes(alt.status)) alt.status = "approved";
    else if (action === "decline" && open.includes(alt.status)) {
      if (!reason.trim()) return bad(res, "A reason is required");
      alt.status = !admin && alt.covered ? "escalated" : "declined";   // covered claims go to platform support
      alt.reason = reason;
    } else if (action === "complete" && alt.status === "approved") alt.status = "completed";
    else return bad(res, "Action not allowed", 409);
    await alt.save();
    res.json(alt);
  } catch { bad(res, "Could not update request", 500); }
});
module.exports = router;
