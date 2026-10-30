const mongoose = require("mongoose");
const CFG = require("./config");
const ref = (m) => ({ type: mongoose.Schema.Types.ObjectId, ref: m, required: true });

const orderSchema = new mongoose.Schema({
  customer: ref("User"), tailor: ref("User"), design: ref("Design"),
  fabric: { type: String, enum: Object.keys(CFG.fabrics), default: "Cotton" },
  fabricSource: { type: String, enum: ["tailor", "customer"], default: "tailor" },
  fabricColor: { type: String, required: true, maxlength: 7, match: /^#[0-9a-fA-F]{6}$/ },
  clothPhoto: Buffer,
  clothPhotoMime: { type: String, enum: ["image/jpeg"] },
  measurements: { type: Map, of: Number, default: {} },           // inches
  customizationNotes: { type: String, maxlength: 2000 },
  deliveryAddress: { type: String, required: true },
  contactPhone: { type: String, required: true },
  express: { type: Boolean, default: false },
  pickup: { requested: { type: Boolean, default: false }, slot: String },
  distanceKm: Number,
  tailoringCharge: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, default: 0, min: 0 },
  pickupCharge: { type: Number, default: 0, min: 0 },
  platformFee: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  readyDate: Date, deliveryDate: { type: Date, required: true }, deliveredAt: Date,
  status: {
    type: String, default: "pending",
    enum: ["pending", "accepted", "pickup_collected", "stitching", "quality_check", "ready",
           "out_for_delivery", "delivered", "cancelled", "declined"]
  },
  cancelReason: { type: String, maxlength: 500 },
  statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: String, _id: false }],
  paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },   // cash on delivery
  review: { rating: { type: Number, min: 1, max: 5 }, at: Date }
}, { timestamps: true });

orderSchema.index({ tailor: 1, status: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);
