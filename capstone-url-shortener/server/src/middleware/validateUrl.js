const BLOCKED_DOMAINS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "is.gd",
  "ow.ly",
];

function validateUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url (string) is required" });
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res
        .status(400)
        .json({ error: "Only http and https URLs are allowed" });
    }

    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
      return res
        .status(400)
        .json({ error: "Shortening other shortener URLs is not allowed" });
    }

    req.body.url = trimmed;
    next();
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }
}

module.exports = { validateUrl };
