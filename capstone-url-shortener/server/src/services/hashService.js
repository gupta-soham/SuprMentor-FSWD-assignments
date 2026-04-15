const crypto = require("crypto");
const base62 = require("../utils/base62");
const Url = require("../models/Url");

const CODE_LENGTH = parseInt(process.env.SHORT_CODE_LENGTH, 10) || 7;
const MAX_RETRIES = parseInt(process.env.MAX_COLLISION_RETRIES, 10) || 10;

/**
 * Normalize a URL so equivalent URLs always produce the same hash.
 * Strips trailing slashes and lowercases the scheme + host.
 */
function normalizeUrl(raw) {
  try {
    const u = new URL(raw);
    u.hostname = u.hostname.toLowerCase();
    let href = u.href;
    if (href.endsWith("/") && u.pathname === "/") {
      href = href.slice(0, -1);
    }
    return href;
  } catch {
    return raw.trim();
  }
}

/**
 * Generate a short code from a long URL using SHA-256 + Base62.
 *
 * Collision strategy:
 * 1. Hash the normalized URL with SHA-256
 * 2. Take first 7 bytes → Base62 encode → trim/pad to CODE_LENGTH
 * 3. Look up the code in MongoDB:
 *    - No match        → new entry, return code
 *    - Same longUrl    → deduplication, return existing
 *    - Different URL   → COLLISION: append "\0{attempt}" to input, rehash
 * 4. Retry up to MAX_RETRIES times
 */
async function generateShortCode(rawUrl) {
  const longUrl = normalizeUrl(rawUrl);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const input = attempt === 0 ? longUrl : `${longUrl}\0${attempt}`;
    const hash = crypto.createHash("sha256").update(input).digest();
    let code = base62.encode(hash, 7);

    if (code.length > CODE_LENGTH) code = code.slice(0, CODE_LENGTH);
    while (code.length < CODE_LENGTH) code = "0" + code;

    const existing = await Url.findOne({ shortCode: code }).lean();

    if (!existing) {
      return { shortCode: code, longUrl, isNew: true };
    }

    if (existing.longUrl === longUrl) {
      return { shortCode: code, longUrl, isNew: false, existing };
    }

    // Collision with a different URL — retry with salted input
  }

  throw new Error(
    `Hash collision unresolved after ${MAX_RETRIES} retries for URL: ${rawUrl}`,
  );
}

module.exports = { generateShortCode, normalizeUrl };
