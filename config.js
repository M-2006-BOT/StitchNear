// All money and policy rules live here. The server is the only place prices are calculated.
module.exports = {
  baseDelivery: 40, perKm: 15, express: 100, pickup: 50,
  defaultKm: 3,            // used when the customer shares no location
  commission: 10,          // % of stitching charge kept by the platform
  fitWindowDays: 7, tolerance: 0.5,
  fabrics: { Cotton: 0, Linen: 150, Georgette: 250, Silk: 600 },
  categories: ["Blouses", "Kurtis", "Dresses", "Shirts", "Ethnic Wear", "Alterations"]
};
