const mongoose = require("mongoose");
const CFG = require("./config");

module.exports = mongoose.model("TailorListing", new mongoose.Schema({
  tailor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: CFG.categories, required: true },
  description: { type: String, maxlength: 1000, default: "" },
  image: { type: String, maxlength: 2048, default: "" },
  price: { type: Number, required: true, min: 0, max: 100000 },
  stitchDays: { type: Number, required: true, min: 1, max: 60 },
  deliveryDays: { type: Number, required: true, min: 1, max: 60 },
  deliveryCharge: { type: Number, required: true, min: 0, max: 100000 },
  active: { type: Boolean, default: true }
}, { timestamps: true }));
