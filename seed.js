// npm run seed : creates the first admin, sample designs and demo tailors (safe to re-run).
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./User");
const Design = require("./Design");

const designs = [
  ["Classic Floral Blouse", "Blouses", 499, 3], ["Custom Occasion Blouse", "Blouses", 649, 4],
  ["Everyday Chic Kurti", "Kurtis", 699, 4], ["Elegant Occasion Dress", "Dresses", 899, 6],
  ["Minimal Everyday Dress", "Dresses", 799, 5], ["Tailored Classic Shirt", "Shirts", 599, 3],
  ["Festive Ethnic Style", "Ethnic Wear", 999, 8], ["Fit and Finish Alteration", "Alterations", 199, 2]];
// Demo tailors around one sample point (lng, lat). Replace with your city.
const C = [77.5946, 12.9716];
const tailors = [
  ["Rani Tailors", ["Blouses", "Ethnic Wear", "Dresses"], 1.1, 3, true, 4.8, 212, [0.010, 0.004]],
  ["Ahmed Fashion House", ["Shirts", "Kurtis", "Alterations"], 1, 2, true, 4.6, 148, [-0.020, 0.012]],
  ["Meena Boutique", ["Dresses", "Ethnic Wear", "Blouses"], 1.35, 2, false, 4.9, 301, [0.030, -0.020]],
  ["Quick Stitch Corner", ["Alterations", "Shirts"], 0.9, 5, false, 4.2, 77, [-0.006, -0.004]]];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) in .env");
  const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
  await User.findOneAndUpdate(
    { email: adminEmail },
    { $set: { name: "Admin", email: adminEmail, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: "admin", approved: true } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  if (!(await Design.countDocuments()))
    await Design.insertMany(designs.map(([name, category, startingPrice, stitchDays]) => ({ name, category, startingPrice, stitchDays })));
  const pw = crypto.randomBytes(9).toString("base64url");
  let made = 0;
  for (const [i, [name, specialties, rateMultiplier, capacity, offersPickup, avg, count, off]] of tailors.entries()) {
    const email = `tailor${i + 1}@stitchnear.example`;
    if (await User.exists({ email })) continue;
    await User.create({ name, email, password: await bcrypt.hash(pw, 12), role: "tailor", approved: true, area: "Demo area",
      specialties, rateMultiplier, capacity, offersPickup, accepting: i !== 3, rating: { avg, count },
      location: { type: "Point", coordinates: [C[0] + off[0], C[1] + off[1]] } });
    made++;
  }
  console.log("Seed complete.");
  if (made) console.log(`Demo tailors: tailor1..${tailors.length}@stitchnear.example  password: ${pw}  (shown once)`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
