const mongoose = require("mongoose");
const ref = (m) => ({ type: mongoose.Schema.Types.ObjectId, ref: m, required: true });

module.exports = mongoose.model("Alteration", new mongoose.Schema({
  order: ref("Order"), customer: ref("User"), tailor: ref("User"),
  area: { type: String, enum: ["Chest", "Waist", "Hip", "Length", "Other"], required: true },
  diffInches: { type: Number, required: true, min: 0, max: 20 },
  note: { type: String, maxlength: 1000 },
  covered: { type: Boolean, required: true },          // decided by the server from the fit-guarantee terms
  status: { type: String, enum: ["requested", "approved", "declined", "escalated", "completed"], default: "requested" },
  reason: String
}, { timestamps: true }));
