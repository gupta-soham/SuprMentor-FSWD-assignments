const Url = require("../models/Url");
const { generateShortCode } = require("../services/hashService");

const BASE_URL = process.env.BASE_URL || "http://localhost";

async function shorten(req, res) {
  try {
    const { url } = req.body;
    const { shortCode, longUrl, isNew, existing } =
      await generateShortCode(url);

    if (!isNew) {
      return res.json({
        shortUrl: `${BASE_URL}/${existing.shortCode}`,
        shortCode: existing.shortCode,
        longUrl: existing.longUrl,
        created: false,
      });
    }

    const doc = await Url.create({ longUrl, shortCode });
    res.status(201).json({
      shortUrl: `${BASE_URL}/${doc.shortCode}`,
      shortCode: doc.shortCode,
      longUrl: doc.longUrl,
      created: true,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Short code conflict, please retry" });
    }
    res.status(500).json({ error: err.message });
  }
}

async function redirect(req, res) {
  try {
    const { code } = req.params;
    const doc = await Url.findOneAndUpdate(
      { shortCode: code },
      {
        $inc: { clicks: 1 },
        $push: {
          clickLog: {
            timestamp: new Date(),
            referrer: req.get("referer") || "",
            userAgent: req.get("user-agent") || "",
          },
        },
      },
      { new: true },
    );

    if (!doc) return res.status(404).json({ error: "Short URL not found" });
    res.redirect(302, doc.longUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listUrls(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20),
    );
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find()
        .select("-clickLog")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Url.countDocuments(),
    ]);

    res.json({
      urls: urls.map((u) => ({
        ...u,
        shortUrl: `${BASE_URL}/${u.shortCode}`,
      })),
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function stats(req, res) {
  try {
    const doc = await Url.findOne({ shortCode: req.params.code }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json({
      shortCode: doc.shortCode,
      shortUrl: `${BASE_URL}/${doc.shortCode}`,
      longUrl: doc.longUrl,
      clicks: doc.clicks,
      recentClicks: (doc.clickLog || []).slice(-50),
      createdAt: doc.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUrl(req, res) {
  try {
    const doc = await Url.findOneAndDelete({ shortCode: req.params.code });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, shortCode: doc.shortCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { shorten, redirect, listUrls, stats, deleteUrl };
