const express = require("express");
const mongoose = require("mongoose");
const Order = require("./Order");
const Design = require("./Design");
const User = require("./User");
const CFG = require("./config");
const { auth, allowRoles } = require("./auth");
const { quote, haversineKm, ACTIVE } = require("./pricing");
const router = express.Router();

const MKEYS = ["chest", "waist", "hip", "length"];
function cleanMeasurements(m) {
  const out = {};
  if (m && typeof m === "object") for (const k of MKEYS) {
    if (m[k] === undefined || m[k] === "" || m[k] === null) continue;
    const v = Number(m[k]);
    if (!Number.isFinite(v) || v < 5 || v > 100) return null;
    out[k] = v;
  }
  return out;
}
const nextStatuses = (o) => ({
  pending: ["accepted", "declined"],
  accepted: [o.pickup?.requested ? "pickup_collected" : "stitching"],
  pickup_collected: ["stitching"], stitching: ["quality_check"],
  quality_check: ["stitching", "ready"], ready: ["out_for_delivery"], out_for_delivery: ["delivered"]
}[o.status] || []);
const bad = (res, m, c = 400) => res.status(c).json({ message: m });

// Customer places an order. Every price and date is calculated here, never taken from the client.
router.post("/", auth, allowRoles("customer"), async (req, res) => {
  try {
    const b = req.body || {};
    if (!mongoose.isValidObjectId(String(b.tailorId)) || !mongoose.isValidObjectId(String(b.designId)))
      return bad(res, "Invalid tailor or design ID");
    const fabric = b.fabric === undefined ? "Cotton" : String(b.fabric);
    if (!(fabric in CFG.fabrics)) return bad(res, "Invalid fabric");
    const fabricSource = b.fabricSource === undefined ? "tailor" : String(b.fabricSource);
    if (!["tailor", "customer"].includes(fabricSource)) return bad(res, "Choose whether you or the tailor supplies the cloth");
    const fabricColor = typeof b.fabricColor === "string" ? b.fabricColor : "";
    if (!/^#[0-9a-fA-F]{6}$/.test(fabricColor)) return bad(res, "Choose a valid cloth color");
    let clothPhoto, clothPhotoMime;
    if (b.clothPhoto !== undefined && b.clothPhoto !== null && b.clothPhoto !== "") {
      const match = typeof b.clothPhoto === "string" && b.clothPhoto.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!match || match[1].length > 466668) return bad(res, "Cloth photo must be JPEG and 350 KB or smaller");
      clothPhoto = Buffer.from(match[1], "base64");
      if (clothPhoto.length < 3 || clothPhoto.length > 350000 || clothPhoto[0] !== 0xff || clothPhoto[1] !== 0xd8 || clothPhoto[2] !== 0xff)
        return bad(res, "Cloth photo must be a valid JPEG of 350 KB or smaller");
      clothPhotoMime = "image/jpeg";
    }
    if (fabricSource === "tailor" && clothPhoto) return bad(res, "Attach a cloth photo only when you are supplying the cloth");
    const address = String(b.deliveryAddress || "").trim(), phone = String(b.contactPhone || "").replace(/\D/g, "");
    if (address.length < 8 || address.length > 300 || phone.length < 10 || phone.length > 13)
      return bad(res, "A delivery address and a valid phone number are required");
    const measurements = cleanMeasurements(b.measurements);
    if (!measurements) return bad(res, "Measurements must be between 5 and 100 inches");

    const [tailor, design] = await Promise.all([
      User.findOne({ _id: String(b.tailorId), role: "tailor", approved: true }).lean(),
      Design.findOne({ _id: String(b.designId), active: true }).lean()]);
    if (!tailor || !design) return bad(res, "Tailor or design is unavailable");
    if (!tailor.specialties.includes(design.category)) return bad(res, "This tailor does not offer that category");

    const active = await Order.countDocuments({ tailor: tailor._id, status: { $in: ACTIVE } });
    const c = b.coordinates;
    const distanceKm = Array.isArray(c) && c.length === 2 && c.every((x) => Number.isFinite(x)) && tailor.location?.coordinates?.length === 2
      ? haversineKm(c, tailor.location.coordinates) : undefined;
    const q = quote(tailor, design, { fabric, fabricSource, express: !!b.express, pickup: !!b.pickup, distanceKm, active });
    if (q.availability !== "accepting") return bad(res, "This tailor is not taking new orders right now", 409);

    const order = await Order.create({
      customer: req.user.id, tailor: tailor._id, design: design._id, fabric, fabricSource, fabricColor,
      clothPhoto, clothPhotoMime, measurements,
      customizationNotes: String(b.customizationNotes || "").slice(0, 2000),
      deliveryAddress: address, contactPhone: phone, express: !!b.express,
      pickup: { requested: q.pickup, slot: q.pickup ? String(b.pickupSlot || "").slice(0, 60) : undefined },
      distanceKm: q.distanceKm, tailoringCharge: q.stitch, deliveryCharge: q.delivery, pickupCharge: q.pickupFee,
      platformFee: q.platformFee, totalAmount: q.total, readyDate: q.readyDate, deliveryDate: q.deliveryDate,
      statusHistory: [{ status: "pending", by: req.user.id }]
    });
    const result = order.toObject();
    result.clothPhoto = null;
    delete result.clothPhotoMime;
    res.status(201).json(result);
  } catch { bad(res, "Could not create order"); }
});

// Customers see their orders, tailors see theirs, admins see all (paginated).
router.get("/my", auth, async (req, res) => {
  try {
    const filter = req.user.role === "customer" ? { customer: req.user.id }
      : req.user.role === "tailor" ? { tailor: req.user.id } : {};
    const limit = Math.min(Number(req.query.limit) || 50, 100), skip = Math.max(Number(req.query.skip) || 0, 0);
    const orders = await Order.find(filter).populate("design", "name category image").populate("customer", "name")
      .populate("tailor", "name area").sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json(orders.map((order) => {
      const result = order.toObject();
      result.clothPhoto = req.user.role !== "admin" && order.clothPhoto
        ? `data:${order.clothPhotoMime};base64,${order.clothPhoto.toString("base64")}` : null;
      delete result.clothPhotoMime;
      return result;
    }));
  } catch { bad(res, "Could not load orders", 500); }
});

// Tailor moves the order along; admin can set any valid status.
router.patch("/:id/status", auth, allowRoles("tailor", "admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid order ID");
    const status = String(req.body?.status || "");
    if (!Order.schema.path("status").enumValues.includes(status)) return bad(res, "Invalid status");
    const order = await Order.findById(req.params.id);
    if (!order) return bad(res, "Order not found", 404);
    if (req.user.role === "tailor" && order.tailor.toString() !== req.user.id) return bad(res, "Access denied", 403);
    if (req.user.role !== "admin" && !nextStatuses(order).includes(status)) return bad(res, "This status transition is not allowed");
    const filter = { _id: order._id, status: order.status };
    if (req.user.role === "tailor") filter.tailor = req.user.id;
    const update = {
      $set: { status },
      $push: { statusHistory: { status, by: req.user.id } }
    };
    if (status === "delivered") {
      update.$set.deliveredAt = new Date();
      update.$set.paymentStatus = "paid";
    }
    const updated = await Order.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    if (!updated) return bad(res, "Order changed while you were updating it. Refresh and try again.", 409);
    res.json({ message: "Order status updated", order: updated });
  } catch (error) {
    console.error("Could not update order status:", error);
    bad(res, "Could not update order", 500);
  }
});

router.patch("/:id/cancel", auth, allowRoles("customer"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid order ID");
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  if (!reason || reason.length > 500) return bad(res, "A cancellation reason of 1 to 500 characters is required");
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, customer: req.user.id, status: { $in: ["pending", "accepted"] } },
    { status: "cancelled", cancelReason: reason, $push: { statusHistory: { status: "cancelled", by: req.user.id } } }, { new: true });
  order ? res.json(order) : bad(res, "Only orders not yet in pickup or stitching can be cancelled", 409);
});

router.post("/:id/review", auth, allowRoles("customer"), async (req, res) => {
  try {
    const rating = Number(req.body?.rating);
    if (!mongoose.isValidObjectId(req.params.id) || !Number.isInteger(rating) || rating < 1 || rating > 5) return bad(res, "Rating must be 1 to 5");
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id, status: "delivered", "review.rating": { $exists: false } },
      { review: { rating, at: new Date() } }, { new: true });
    if (!order) return bad(res, "Only delivered orders can be rated, once", 409);
    await User.updateOne({ _id: order.tailor }, [{ $set: {
      "rating.avg": { $round: [{ $divide: [{ $add: [{ $multiply: [{ $ifNull: ["$rating.avg", 0] }, { $ifNull: ["$rating.count", 0] }] }, rating] },
                                           { $add: [{ $ifNull: ["$rating.count", 0] }, 1] }] }, 2] },
      "rating.count": { $add: [{ $ifNull: ["$rating.count", 0] }, 1] } } }]);
    res.json(order);
  } catch { bad(res, "Could not save rating", 500); }
});
module.exports = router;
