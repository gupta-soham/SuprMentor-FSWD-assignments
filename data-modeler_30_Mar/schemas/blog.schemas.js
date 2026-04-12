/**
 * Blogging platform — MongoDB / Mongoose schema sketches
 * Assignment 30 Mar 2026 — Data Modeler
 *
 * Not wired to a server; copy into models/ when implementing CRUD Lab / full app.
 */

// const mongoose = require("mongoose");

/*
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["reader", "author", "admin"], default: "reader" },
    bio: { type: String, maxlength: 500 },
    avatarUrl: String,
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, maxlength: 500 },
    body: { type: String, required: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    publishedAt: Date,
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", body: "text" });
postSchema.index({ authorId: 1, createdAt: -1 });

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    body: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });

module.exports = { userSchema, postSchema, commentSchema };
*/

module.exports = {
  notes: "Uncomment mongoose blocks after npm install mongoose",
};
