const CFG = require("./config");
const DAY = 864e5;
const ACTIVE = ["pending", "accepted", "pickup_collected", "stitching", "quality_check", "ready", "out_for_delivery"];

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const r = Math.PI / 180, a = Math.sin((lat2 - lat1) * r / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lng2 - lng1) * r / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function quote(tailor, design, { fabric = "Cotton", fabricSource = "tailor", express = false, pickup = false, distanceKm, active = 0 }) {
  const fabricCharge = fabricSource === "customer" ? 0 : (CFG.fabrics[fabric] || 0);
  const stitch = Math.round(design.startingPrice * (tailor.rateMultiplier || 1)) + fabricCharge;
  const km = Number.isFinite(distanceKm) ? distanceKm : CFG.defaultKm;
  const delivery = Math.round(CFG.baseDelivery + km * CFG.perKm + (express ? CFG.express : 0));
  const usePickup = !!pickup && !!tailor.offersPickup;
  const pickupFee = usePickup ? CFG.pickup : 0;
  const cap = Math.max(1, tailor.capacity || 1);
  const days = (design.stitchDays || 4) + Math.floor(active / cap) + (usePickup ? 1 : 0);
  const readyDate = new Date(Date.now() + days * DAY);
  const deliveryDate = new Date(readyDate.getTime() + (express ? 0 : DAY));
  const availability = !tailor.accepting ? "paused" : active >= cap * 4 ? "full" : "accepting";
  return {
    stitch, delivery, pickupFee, pickup: usePickup, total: stitch + delivery + pickupFee,
    platformFee: Math.round(stitch * CFG.commission / 100), distanceKm: Math.round(km * 10) / 10,
    readyDate, deliveryDate, availability
  };
}
module.exports = { quote, haversineKm, ACTIVE, DAY };
