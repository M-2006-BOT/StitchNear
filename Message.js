const mongoose = require("mongoose");

module.exports = mongoose.model("Message", new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, maxlength: 2000, default: "" },
  photo: Buffer,
  photoMime: { type: String, enum: ["image/jpeg"], default: undefined }
}, { timestamps: true }));
