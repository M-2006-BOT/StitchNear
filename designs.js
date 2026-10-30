const express = require("express");
const mongoose = require("mongoose");
const Design = require("./Design");
const CFG = require("./config");
const { auth, allowRoles } = require("./auth");
const router = express.Router();

const pick = (b = {}) => Object.fromEntries(
  ["name", "category", "image", "description", "startingPrice", "stitchDays", "active"]
    .filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));

router.get("/manage", auth, allowRoles("admin"), async (req, res) => {
  try { res.json(await Design.find().sort({ createdAt: -1 }).limit(200)); }
  catch { res.status(500).json({ message: "Could not load designs" }); }
});

router.get("/", async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category !== undefined) {
      const c = String(req.query.category);                     // blocks ?category[$ne]=x
      if (!CFG.categories.includes(c)) return res.status(400).json({ message: "Invalid category" });
      filter.category = c;
    }
    res.json(await Design.find(filter).sort({ createdAt: -1 }).limit(100));
  } catch { res.status(500).json({ message: "Could not load designs" }); }
});

router.post("/", auth, allowRoles("admin"), async (req, res) => {
  try { res.status(201).json(await Design.create(pick(req.body))); }
  catch { res.status(400).json({ message: "Invalid design details" }); }
});

router.patch("/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid design ID" });
    const d = await Design.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    d ? res.json(d) : res.status(404).json({ message: "Design not found" });
  } catch { res.status(400).json({ message: "Invalid design details" }); }
});

router.delete("/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid design ID" });
    const design = await Design.findByIdAndUpdate(req.params.id, { active: false }, { new: true, runValidators: true });
    design ? res.json(design) : res.status(404).json({ message: "Design not found" });
  } catch { res.status(500).json({ message: "Could not remove design" }); }
});

module.exports = router;
