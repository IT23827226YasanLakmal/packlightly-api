  const mongoose = require("mongoose");

  const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ownerUid: { type: String, required: true }, // Firebase user UID who owns this post
    tags: [{ type: String }],
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String, default: "" }, // store image path or URL
  likeCount: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of Firebase user UIDs who liked this post
  comments: [
      {
        user: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  });

  module.exports = mongoose.model("Post", postSchema);
