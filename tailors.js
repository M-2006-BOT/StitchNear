const express = require("express");
const mongoose = require("mongoose");
const User = require("./User");
const Design = require("./Design");
const Order = require("./Order");
const TailorListing = require("./TailorListing");
const CFG = require("./config");
const { auth, allowRoles } = require("./auth");
const { quote, ACTIVE } = require("./pricing");
const router = express.Router();

// Nearby tailors with live price, availability and completion date.
// GET /api/tailors?designId=&fabric=&express=1&pickup=1&lat=&lng=&sort=near|rating|price|soon
router.get("/", async (req, res) => {
  try {
    const q = req.query, lat = Number(q.lat), lng = Number(q.lng);
    const hasLoc = q.lat !== undefined && q.lng !== undefined && Number.isFinite(lat) && Number.isFinite(lng);
    const fabric = q.fabric === undefined ? "Cotton" : String(q.fabric);
    if (!(fabric in CFG.fabrics)) return res.status(400).json({ message: "Invalid fabric" });

    let design = null;
    if (q.designId !== undefined) {
      if (!mongoose.isValidObjectId(String(q.designId))) return res.status(400).json({ message: "Invalid design ID" });
      design = await Design.findOne({ _id: String(q.designId), active: true }).lean();
      if (!design) return res.status(404).json({ message: "Design not found" });
    }

    const match = { role: "tailor", approved: true };
    if (q.area) match.area = new RegExp("^" + String(q.area).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
    const hide = { password: 0, email: 0, phone: 0, role: 0, approved: 0, __v: 0 };
    const tailors = hasLoc
      ? await User.aggregate([
          { $geoNear: { near: { type: "Point", coordinates: [lng, lat] }, distanceField: "distM", spherical: true, query: match } },
          { $limit: 50 }, { $project: hide }])
      : await User.find(match).select("-password -email -phone -role -approved -__v").limit(50).lean();

    const counts = await Order.aggregate([
      { $match: { tailor: { $in: tailors.map((t) => t._id) }, status: { $in: ACTIVE } } },
      { $group: { _id: "$tailor", n: { $sum: 1 } } }]);
    const active = Object.fromEntries(counts.map((c) => [c._id.toString(), c.n]));

    let out = tailors.map((t) => {
      const n = active[t._id.toString()] || 0;
      const km = t.distM != null ? t.distM / 1000 : undefined;
      const base = { _id: t._id, name: t.name, area: t.area, specialties: t.specialties, rating: t.rating,
                     offersPickup: t.offersPickup, activeOrders: n, distanceKm: km == null ? null : Math.round(km * 10) / 10 };
      if (!design) return { ...base, availability: !t.accepting ? "paused" : n >= t.capacity * 4 ? "full" : "accepting" };
      return { ...base, specialtyMatch: t.specialties.includes(design.category),
               ...quote(t, design, { fabric, fabricSource: q.fabricSource === "customer" ? "customer" : "tailor", express: q.express === "1", pickup: q.pickup === "1", distanceKm: km, active: n }) };
    });

    const sorts = { rating: (a, b) => b.rating.avg - a.rating.avg, price: (a, b) => (a.stitch ?? 0) - (b.stitch ?? 0),
                    soon: (a, b) => new Date(a.readyDate || 0) - new Date(b.readyDate || 0),
                    near: (a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99) };
    res.json(out.sort(sorts[q.sort] || sorts.near));
  } catch (e) { res.status(500).json({ message: "Could not load tailors" }); }
});

router.get("/me", auth, allowRoles("tailor"), async (req, res) => {
  const t = await User.findById(req.user.id).select("-__v").lean();
  res.json({ ...t, activeOrders: await Order.countDocuments({ tailor: t._id, status: { $in: ACTIVE } }) });
});

// Tailors control their own availability and pricing within platform limits.
router.patch("/me", auth, allowRoles("tailor"), async (req, res) => {
  try {
    const b = req.body || {}, set = {};
    if (typeof b.accepting === "boolean") set.accepting = b.accepting;
    if (typeof b.offersPickup === "boolean") set.offersPickup = b.offersPickup;
    if (b.rateMultiplier !== undefined) set.rateMultiplier = Math.min(2, Math.max(0.7, Number(b.rateMultiplier) || 1));
    if (b.capacity !== undefined) set.capacity = Math.min(20, Math.max(1, Math.round(Number(b.capacity)) || 1));
    if (typeof b.area === "string") set.area = b.area.slice(0, 80);
    if (Array.isArray(b.specialties)) { const s = b.specialties.filter((x) => CFG.categories.includes(x)); if (s.length) set.specialties = s; }
    if (Number.isFinite(b.lat) && Number.isFinite(b.lng) && Math.abs(b.lat) <= 90 && Math.abs(b.lng) <= 180)
      set.location = { type: "Point", coordinates: [b.lng, b.lat] };
    res.json(await User.findByIdAndUpdate(req.user.id, set, { new: true, runValidators: true }).select("-__v"));
  } catch { res.status(400).json({ message: "Invalid profile details" }); }
});

const listingFields = ["name", "category", "description", "image", "price", "stitchDays", "deliveryDays", "deliveryCharge"];
function cleanListing(body = {}) {
  const listing = {};
  for (const key of listingFields) if (body[key] !== undefined) listing[key] = body[key];
  if (listing.image !== undefined && listing.image !== "" &&
      (typeof listing.image !== "string" || !/^https:\/\//i.test(listing.image) || listing.image.length > 2048))
    throw new Error("Image must be an HTTPS URL");
  return listing;
}

router.get("/me/listings", auth, allowRoles("tailor"), async (req, res) => {
  try { res.json(await TailorListing.find({ tailor: req.user.id }).sort({ createdAt: -1 }).limit(100).lean()); }
  catch { res.status(500).json({ message: "Could not load your garment listings" }); }
});

router.post("/me/listings", auth, allowRoles("tailor"), async (req, res) => {
  try {
    const listing = await TailorListing.create({ ...cleanListing(req.body), tailor: req.user.id });
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message === "Image must be an HTTPS URL" ? err.message : "Provide a name, valid category, price, stitching time, delivery time and delivery charge" });
  }
});

router.patch("/me/listings/:listingId", auth, allowRoles("tailor"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.listingId)) return res.status(400).json({ message: "Invalid listing ID" });
    const listing = await TailorListing.findOneAndUpdate(
      { _id: req.params.listingId, tailor: req.user.id }, cleanListing(req.body),
      { new: true, runValidators: true });
    listing ? res.json(listing) : res.status(404).json({ message: "Garment listing not found" });
  } catch (err) {
    res.status(400).json({ message: err.message === "Image must be an HTTPS URL" ? err.message : "Invalid garment listing details" });
  }
});

router.delete("/me/listings/:listingId", auth, allowRoles("tailor"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.listingId)) return res.status(400).json({ message: "Invalid listing ID" });
  const listing = await TailorListing.findOneAndUpdate(
    { _id: req.params.listingId, tailor: req.user.id }, { active: false }, { new: true });
  listing ? res.json({ message: "Garment listing removed" }) : res.status(404).json({ message: "Garment listing not found" });
});

router.get("/:id/listings", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid tailor ID" });
  const tailor = await User.findOne({ _id: req.params.id, role: "tailor", approved: true })
    .select("name area specialties rating offersPickup");
  if (!tailor) return res.status(404).json({ message: "Tailor not found" });
  try {
    const listings = await TailorListing.find({ tailor: tailor._id, active: true }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ tailor, listings });
  } catch { res.status(500).json({ message: "Could not load tailor garments" }); }
});

module.exports = router;
