const Url = require("../models/Url");
const { generateShortCode } = require("../services/hashService");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const BASE_URL = process.env.BASE_URL || "http://localhost";

const geoCache = new Map();

function isPrivateIp(ip) {
  if (!ip) return true;
  return /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|::1$|localhost|fc|fd|fe80)/.test(
    ip,
  );
}

async function fetchGeoFromApi(ip) {
  const cacheKey = isPrivateIp(ip) ? "__public__" : ip;
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey);

  try {
    const url = isPrivateIp(ip)
      ? "http://ip-api.com/json/"
      : `http://ip-api.com/json/${ip}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();

    if (data.status === "success") {
      const geo = {
        country: data.countryCode || "",
        city: data.city || "",
        lat: data.lat ?? null,
        lng: data.lon ?? null,
      };
      geoCache.set(cacheKey, geo);
      return geo;
    }
  } catch {
    /* network unavailable, skip */
  }
  return null;
}

async function parseVisitor(req) {
  const ua = new UAParser(req.get("user-agent") || "");
  const device = ua.getDevice();
  const browser = ua.getBrowser();
  const os = ua.getOS();
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.ip;

  const cleanIp = ip?.replace(/^::ffff:/, "");
  const localGeo = geoip.lookup(cleanIp);

  let country = localGeo?.country || "";
  let city = localGeo?.city || "";
  let lat = localGeo?.ll?.[0] ?? null;
  let lng = localGeo?.ll?.[1] ?? null;

  if (!localGeo) {
    const ext = await fetchGeoFromApi(cleanIp);
    if (ext) {
      country = ext.country;
      city = ext.city;
      lat = ext.lat;
      lng = ext.lng;
    }
  }

  return {
    timestamp: new Date(),
    referrer: req.get("referer") || "",
    userAgent: req.get("user-agent") || "",
    ip,
    device: device.type || "desktop",
    browser: browser.name || "Unknown",
    os: os.name || "Unknown",
    country,
    city,
    lat,
    lng,
  };
}

function aggregateField(clicks, field) {
  const counts = {};
  clicks.forEach((c) => {
    const key = c[field] || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

function aggregateReferrers(clicks) {
  const counts = {};
  clicks.forEach((c) => {
    if (!c.referrer) {
      counts["Direct"] = (counts["Direct"] || 0) + 1;
      return;
    }
    try {
      const host = new URL(c.referrer).hostname || "Direct";
      counts[host] = (counts[host] || 0) + 1;
    } catch {
      counts["Direct"] = (counts["Direct"] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

async function shorten(req, res) {
  try {
    const { url, expiresIn } = req.body;
    const expiresAt =
      expiresIn && Number(expiresIn) > 0
        ? new Date(Date.now() + Number(expiresIn) * 1000)
        : null;

    const { shortCode, longUrl, isNew, existing } =
      await generateShortCode(url);

    if (!isNew) {
      return res.json({
        shortUrl: `${BASE_URL}/${existing.shortCode}`,
        shortCode: existing.shortCode,
        longUrl: existing.longUrl,
        expiresAt: existing.expiresAt || null,
        created: false,
      });
    }

    const doc = await Url.create({ longUrl, shortCode, expiresAt });
    res.status(201).json({
      shortUrl: `${BASE_URL}/${doc.shortCode}`,
      shortCode: doc.shortCode,
      longUrl: doc.longUrl,
      expiresAt: doc.expiresAt || null,
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
    const visitor = await parseVisitor(req);

    const doc = await Url.findOneAndUpdate(
      {
        shortCode: code,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      },
      { $inc: { clicks: 1 }, $push: { clickLog: visitor } },
      { new: true },
    );

    if (doc) return res.redirect(302, doc.longUrl);

    const exists = await Url.exists({ shortCode: code });
    if (exists) return res.status(410).json({ error: "This link has expired" });
    return res.status(404).json({ error: "Short URL not found" });
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

    const clicks = doc.clickLog || [];
    const uniqueIps = new Set(clicks.map((c) => c.ip).filter(Boolean));

    const hourly = Array(168).fill(0);
    clicks.forEach((c) => {
      const d = new Date(c.timestamp);
      hourly[d.getDay() * 24 + d.getHours()]++;
    });

    const geoMap = new Map();
    clicks.forEach((c) => {
      if (c.lat != null && c.lng != null && c.country) {
        const key = `${c.lat.toFixed(1)},${c.lng.toFixed(1)}`;
        const existing = geoMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          geoMap.set(key, {
            lat: c.lat,
            lng: c.lng,
            city: c.city || "",
            country: c.country,
            count: 1,
          });
        }
      }
    });

    res.json({
      shortCode: doc.shortCode,
      shortUrl: `${BASE_URL}/${doc.shortCode}`,
      longUrl: doc.longUrl,
      clicks: doc.clicks,
      uniqueVisitors: uniqueIps.size,
      expiresAt: doc.expiresAt || null,
      recentClicks: clicks.slice(-50),
      devices: aggregateField(clicks, "device"),
      browsers: aggregateField(clicks, "browser"),
      operatingSystems: aggregateField(clicks, "os"),
      referrers: aggregateReferrers(clicks),
      countries: aggregateField(clicks, "country"),
      geoLocations: Array.from(geoMap.values()),
      hourlyActivity: hourly,
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
