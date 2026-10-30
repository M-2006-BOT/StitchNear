const express = require("express");
const mongoose = require("mongoose");
const Conversation = require("./Conversation");
const Message = require("./Message");
const User = require("./User");
const { auth } = require("./auth");
const router = express.Router();
router.use(auth);

function isParticipant(conversation, user) {
  return user.role === "customer" && conversation.customer.toString() === user.id ||
    user.role === "tailor" && conversation.tailor.toString() === user.id;
}

router.get("/", async (req, res) => {
  if (!["customer", "tailor"].includes(req.user.role)) return res.status(403).json({ message: "Messaging is not available for this account" });
  try {
    const filter = req.user.role === "customer" ? { customer: req.user.id } : { tailor: req.user.id };
    const conversations = await Conversation.find(filter)
      .populate(req.user.role === "customer" ? "tailor" : "customer", "name area")
      .sort({ updatedAt: -1 }).limit(100).lean();
    const latest = await Message.aggregate([
      { $match: { conversation: { $in: conversations.map((c) => c._id) } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$conversation", text: { $first: "$text" }, hasPhoto: { $first: { $ne: [{ $type: "$photo" }, "missing"] } }, createdAt: { $first: "$createdAt" } } }
    ]);
    const byId = new Map(latest.map((m) => [m._id.toString(), m]));
    res.json(conversations.map((c) => ({ ...c, latestMessage: byId.get(c._id.toString()) || null })));
  } catch { res.status(500).json({ message: "Could not load conversations" }); }
});

router.post("/with/:tailorId", async (req, res) => {
  if (req.user.role !== "customer") return res.status(403).json({ message: "Only customers can start a conversation" });
  if (!mongoose.isValidObjectId(req.params.tailorId)) return res.status(400).json({ message: "Invalid tailor ID" });
  if (!await User.exists({ _id: req.params.tailorId, role: "tailor", approved: true }))
    return res.status(404).json({ message: "Tailor not found" });
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { customer: req.user.id, tailor: req.params.tailorId },
      { $setOnInsert: { customer: req.user.id, tailor: req.params.tailorId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(conversation);
  } catch (err) {
    if (err.code === 11000) {
      const conversation = await Conversation.findOne({ customer: req.user.id, tailor: req.params.tailorId });
      if (conversation) return res.json(conversation);
    }
    res.status(500).json({ message: "Could not start conversation" });
  }
});

router.get("/:id/messages", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid conversation ID" });
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !isParticipant(conversation, req.user)) return res.status(404).json({ message: "Conversation not found" });
  try {
    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(100).lean();
    res.json(messages.reverse().map((m) => ({
      _id: m._id, sender: m.sender.toString(), text: m.text, createdAt: m.createdAt,
      image: m.photo ? `data:${m.photoMime};base64,${m.photo.toString("base64")}` : null
    })));
  } catch { res.status(500).json({ message: "Could not load messages" }); }
});

router.post("/:id/messages", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid conversation ID" });
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !isParticipant(conversation, req.user)) return res.status(404).json({ message: "Conversation not found" });
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  let photo, photoMime;
  if (req.body?.image !== undefined && req.body.image !== null && req.body.image !== "") {
    const match = typeof req.body.image === "string" && req.body.image.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) return res.status(400).json({ message: "Attach a JPEG image only" });
    if (match[1].length > 466668) return res.status(400).json({ message: "Image must be 350 KB or smaller" });
    photo = Buffer.from(match[1], "base64");
    if (photo.length < 3 || photo.length > 350000 || photo[0] !== 0xff || photo[1] !== 0xd8 || photo[2] !== 0xff)
      return res.status(400).json({ message: "Image must be a valid JPEG of 350 KB or smaller" });
    photoMime = "image/jpeg";
  }
  if ((!text && !photo) || text.length > 2000) return res.status(400).json({ message: "Enter a message (up to 2,000 characters) or attach a photo" });
  try {
    const message = await Message.create({ conversation: conversation._id, sender: req.user.id, text, photo, photoMime });
    conversation.updatedAt = new Date();
    await conversation.save();
    res.status(201).json({
      _id: message._id, sender: message.sender.toString(), text: message.text, createdAt: message.createdAt,
      image: message.photo ? `data:${message.photoMime};base64,${message.photo.toString("base64")}` : null
    });
  } catch { res.status(500).json({ message: "Could not send message" }); }
});

module.exports = router;
