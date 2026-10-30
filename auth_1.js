const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./User");
const Design = require("./Design");
const { auth } = require("./auth");
const CFG = require("./config");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role = "customer", area } = req.body || {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" ||
        !name.trim() || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
      return res.status(400).json({ message: "Name, a valid email and a password of 8+ characters are required" });
    if (!["customer", "tailor"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const specialties = role === "tailor" && Array.isArray(req.body.specialties)
      ? req.body.specialties.filter((s) => CFG.categories.includes(s)) : [];
    if (role === "tailor" && !specialties.length) return res.status(400).json({ message: "Choose at least one specialty" });

    const e = email.trim().toLowerCase();
    if (await User.exists({ email: e })) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({
      name: name.trim(), email: e, password: await bcrypt.hash(password, 12),
      phone: String(phone || "").slice(0, 20), area: String(area || "").slice(0, 80), specialties,
      role, approved: role === "customer"      // tailors wait for admin approval
    });
    res.status(201).json({ message: role === "tailor" ? "Account created. An admin will approve it shortly." : "Account created",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    if (user.role === "tailor" && !user.approved)
      return res.status(403).json({ message: "Tailor account awaits approval" });
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch { res.status(500).json({ message: "Login failed" }); }
});

router.get("/me", auth, async (req, res) => {
  const u = await User.findById(req.user.id).select("name email role phone area addresses sizeProfile stylePreferences notificationPreferences newsletterPreferences settings wishlist")
    .populate("wishlist", "name category image startingPrice stitchDays active");
  u ? res.json(u) : res.status(404).json({ message: "Not found" });
});

router.patch("/me", auth, async (req, res) => {
  try {
    const b = req.body || {}, update = {};
    if (b.name !== undefined) {
      if (typeof b.name !== "string" || !b.name.trim() || b.name.trim().length > 80) return res.status(400).json({ message: "Name must be 1 to 80 characters" });
      update.name = b.name.trim();
    }
    if (b.email !== undefined) {
      const email = String(b.email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
      if (await User.exists({ email, _id: { $ne: req.user.id } })) return res.status(409).json({ message: "Email already registered" });
      update.email = email;
    }
    if (b.phone !== undefined) {
      if (typeof b.phone !== "string" || b.phone.length > 20) return res.status(400).json({ message: "Phone number must be 20 characters or fewer" });
      update.phone = b.phone.trim();
    }
    if (b.addresses !== undefined) {
      if (!Array.isArray(b.addresses) || b.addresses.length > 10 || b.addresses.some((a) =>
        !a || typeof a.label !== "string" || !a.label.trim() || a.label.length > 40 ||
        typeof a.street !== "string" || a.street.trim().length < 8 || a.street.length > 300 ||
        typeof a.phone !== "string" || a.phone.length > 20 || typeof a.isDefault !== "boolean"))
        return res.status(400).json({ message: "Provide up to 10 valid saved addresses" });
      const defaults = b.addresses.filter((a) => a.isDefault).length;
      if (b.addresses.length && defaults !== 1) return res.status(400).json({ message: "Choose exactly one default address" });
      update.addresses = b.addresses.map((a) => ({ label: a.label.trim(), street: a.street.trim(), phone: a.phone.trim(), isDefault: a.isDefault }));
    }
    if (b.sizeProfile !== undefined) {
      const size = b.sizeProfile;
      if (!size || !["tops", "bottoms", "shoes"].every((k) => typeof size[k] === "string" && size[k].length <= 30))
        return res.status(400).json({ message: "Size profile values must be 30 characters or fewer" });
      update.sizeProfile = { tops: size.tops.trim(), bottoms: size.bottoms.trim(), shoes: size.shoes.trim() };
    }
    if (b.stylePreferences !== undefined) {
      const styles = b.stylePreferences;
      if (!styles || !["styles", "fits", "brands"].every((k) => Array.isArray(styles[k]) && styles[k].length <= 20 && styles[k].every((v) => typeof v === "string" && v.length <= 40)))
        return res.status(400).json({ message: "Style preferences must contain up to 20 values per category" });
      update.stylePreferences = styles;
    }
    if (b.notificationPreferences !== undefined) {
      const prefs = b.notificationPreferences, keys = ["priceDrops", "backInStock", "promoCodes", "email", "sms"];
      if (!prefs || keys.some((k) => typeof prefs[k] !== "boolean")) return res.status(400).json({ message: "Invalid notification preferences" });
      update.notificationPreferences = Object.fromEntries(keys.map((k) => [k, prefs[k]]));
    }
    if (b.newsletterPreferences !== undefined) {
      const prefs = b.newsletterPreferences;
      if (!prefs || typeof prefs.email !== "boolean" || typeof prefs.sms !== "boolean") return res.status(400).json({ message: "Invalid newsletter preferences" });
      update.newsletterPreferences = { email: prefs.email, sms: prefs.sms };
    }
    if (b.settings !== undefined) {
      const settings = b.settings;
      if (!settings || !["system", "light", "dark"].includes(settings.theme) ||
          !["en", "hi", "ta", "te", "ml"].includes(settings.language))
        return res.status(400).json({ message: "Choose a supported theme and language" });
      update.settings = { theme: settings.theme, language: settings.language };
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: "No supported profile fields provided" });
    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true })
      .select("name email role phone area addresses sizeProfile stylePreferences notificationPreferences newsletterPreferences settings wishlist");
    user ? res.json(user) : res.status(404).json({ message: "Not found" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
    res.status(500).json({ message: "Could not update profile" });
  }
});

router.patch("/password", auth, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || ""), newPassword = req.body?.newPassword;
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128)
      return res.status(400).json({ message: "New password must be 8 to 128 characters" });
    const user = await User.findById(req.user.id).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password updated" });
  } catch { res.status(500).json({ message: "Could not update password" }); }
});

router.post("/wishlist/:id", auth, async (req, res) => {
  if (req.user.role !== "customer") return res.status(403).json({ message: "Customers only" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid design ID" });
  if (!await Design.exists({ _id: req.params.id, active: true })) return res.status(404).json({ message: "Design not found" });
  await User.updateOne({ _id: req.user.id }, { $addToSet: { wishlist: req.params.id } });
  res.json({ message: "Added to wishlist" });
});

router.delete("/wishlist/:id", auth, async (req, res) => {
  if (req.user.role !== "customer") return res.status(403).json({ message: "Customers only" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid design ID" });
  await User.updateOne({ _id: req.user.id }, { $pull: { wishlist: req.params.id } });
  res.json({ message: "Removed from wishlist" });
});
module.exports = router;
