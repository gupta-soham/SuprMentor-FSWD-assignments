const crypto = require("crypto");
const base62 = require("../src/utils/base62");

describe("base62", () => {
  test("encode produces a non-empty string", () => {
    const hash = crypto
      .createHash("sha256")
      .update("https://example.com")
      .digest();
    const code = base62.encode(hash, 7);
    expect(code.length).toBeGreaterThan(0);
    expect(typeof code).toBe("string");
  });

  test("every character is in the Base62 charset", () => {
    const hash = crypto.createHash("sha256").update("test-input").digest();
    const code = base62.encode(hash, 7);
    for (const ch of code) {
      expect(base62.CHARSET).toContain(ch);
    }
  });

  test("same input always produces the same code", () => {
    const input = "https://example.com/stable";
    const h1 = crypto.createHash("sha256").update(input).digest();
    const h2 = crypto.createHash("sha256").update(input).digest();
    expect(base62.encode(h1, 7)).toBe(base62.encode(h2, 7));
  });

  test("different inputs produce different codes", () => {
    const h1 = crypto.createHash("sha256").update("url-a").digest();
    const h2 = crypto.createHash("sha256").update("url-b").digest();
    expect(base62.encode(h1, 7)).not.toBe(base62.encode(h2, 7));
  });

  test("decode reverses encode for round-trip", () => {
    const hash = crypto.createHash("sha256").update("round-trip").digest();
    const code = base62.encode(hash, 7);
    const num = base62.decode(code);
    expect(typeof num).toBe("bigint");
    expect(num).toBeGreaterThan(0n);
  });
});

describe("collision retry logic (unit)", () => {
  test("salted input changes the resulting code", () => {
    const url = "https://example.com/collide";
    const h0 = crypto.createHash("sha256").update(url).digest();
    const h1 = crypto.createHash("sha256").update(`${url}\x001`).digest();
    const code0 = base62.encode(h0, 7);
    const code1 = base62.encode(h1, 7);
    expect(code0).not.toBe(code1);
  });

  test("each retry attempt yields a distinct code", () => {
    const url = "https://example.com/retry-test";
    const codes = new Set();
    for (let i = 0; i <= 10; i++) {
      const input = i === 0 ? url : `${url}\x00${i}`;
      const hash = crypto.createHash("sha256").update(input).digest();
      codes.add(base62.encode(hash, 7));
    }
    expect(codes.size).toBe(11);
  });
});
