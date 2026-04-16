const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    longUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    clicks: { type: Number, default: 0 },
    clickLog: [
      {
        timestamp: { type: Date, default: Date.now },
        referrer: String,
        userAgent: String,
      },
    ],
  },
  { timestamps: true },
);

urlSchema.index({ longUrl: 1 });

module.exports = mongoose.model("Url", urlSchema);
