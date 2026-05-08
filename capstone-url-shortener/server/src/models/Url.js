const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    longUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    clicks: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    clickLog: [
      {
        timestamp: { type: Date, default: Date.now },
        referrer: String,
        userAgent: String,
        ip: String,
        device: String,
        browser: String,
        os: String,
        country: String,
        city: String,
        lat: Number,
        lng: Number,
      },
    ],
  },
  { timestamps: true },
);

urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
urlSchema.index({ longUrl: 1 });

module.exports = mongoose.model("Url", urlSchema);
