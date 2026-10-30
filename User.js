const mongoose = require("mongoose");
const CFG = require("./config");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["customer", "tailor", "admin"], default: "customer" },
  phone: String,
  addresses: [{ label: { type: String, maxlength: 40 }, street: { type: String, maxlength: 300 }, phone: { type: String, maxlength: 20 }, isDefault: Boolean }],
  sizeProfile: { tops: String, bottoms: String, shoes: String },
  stylePreferences: { styles: [String], fits: [String], brands: [String] },
  notificationPreferences: {
    priceDrops: { type: Boolean, default: true }, backInStock: { type: Boolean, default: true },
    promoCodes: { type: Boolean, default: true }, email: { type: Boolean, default: true }, sms: { type: Boolean, default: false }
  },
  newsletterPreferences: { email: { type: Boolean, default: false }, sms: { type: Boolean, default: false } },
  settings: {
    theme: { type: String, enum: ["system", "light", "dark"], default: "light" },
    language: { type: String, enum: ["en", "hi", "ta", "te", "ml"], default: "en" }
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Design" }],
  area: String,
  specialties: [{ type: String, enum: CFG.categories }],
  approved: { type: Boolean, default: false },
  // Tailor marketplace profile
  accepting: { type: Boolean, default: true },
  offersPickup: { type: Boolean, default: false },
  rateMultiplier: { type: Number, default: 1, min: 0.7, max: 2 },
  capacity: { type: Number, default: 2, min: 1, max: 20 },       // orders finished per day
  rating: { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  location: { type: { type: String, enum: ["Point"] }, coordinates: { type: [Number], default: undefined } }
}, { timestamps: true });

userSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("User", userSchema);
