const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tailor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
conversationSchema.index({ customer: 1, tailor: 1 }, { unique: true });
module.exports = mongoose.model("Conversation", conversationSchema);
