const mongoose = require("mongoose");
const CFG = require("./config");

const designSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: CFG.categories, required: true },
  image: String,
  description: { type: String, maxlength: 1000 },
  startingPrice: { type: Number, required: true, min: 0, max: 100000 },
  stitchDays: { type: Number, default: 4, min: 1, max: 60 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Design", designSchema);
