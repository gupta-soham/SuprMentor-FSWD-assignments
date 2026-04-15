const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = BigInt(CHARSET.length);

/**
 * Encode a Buffer (or its first `byteCount` bytes) into a Base62 string.
 * Treats the bytes as a big-endian unsigned integer.
 */
function encode(buffer, byteCount = 7) {
  const slice = buffer.subarray(0, byteCount);
  let num = BigInt("0x" + Buffer.from(slice).toString("hex"));
  if (num === 0n) return CHARSET[0];

  let result = "";
  while (num > 0n) {
    result = CHARSET[Number(num % BASE)] + result;
    num /= BASE;
  }
  return result;
}

/**
 * Decode a Base62 string back to a BigInt.
 */
function decode(str) {
  let num = 0n;
  for (const ch of str) {
    const idx = CHARSET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid Base62 character: ${ch}`);
    num = num * BASE + BigInt(idx);
  }
  return num;
}

module.exports = { encode, decode, CHARSET };
