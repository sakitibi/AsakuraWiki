// /lib/secureObfuscator.ts
// AES-GCM + PBKDF2 + Z85 (0x21–0x7E printable ASCII) 安全保存用
interface EncryptOptsProps {
  iterations?: number;
  keyLength?: 256 | 128;
}

const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_KEYLEN = 256;

// ---- Z85 encode / decode ----
const Z85_CHARS = (() => {
  let s = "";
  for (let i = 0x21; i <= 0x7E; i++) s += String.fromCharCode(i);
  return s;
})();
const Z85_VALUES: Record<string, number> = {};
for (let i = 0; i < Z85_CHARS.length; i++) Z85_VALUES[Z85_CHARS[i]] = i;

function z85Encode(data: Uint8Array): string {
  if (data.length % 4 !== 0) throw new Error("Z85: data length must be multiple of 4");
  let s = "";
  for (let i = 0; i < data.length; i += 4) {
    const v = 
      (data[i] << 24) >>> 0 |
      (data[i + 1] << 16) |
      (data[i + 2] << 8) |
      (data[i + 3]);
    let div = 85 ** 4;
    for (let j = 0; j < 5; j++) {
      const idx = Math.floor(v / div) % 85;
      s += Z85_CHARS[idx];
      div /= 85;
    }
  }
  return s;
}

function z85Decode(s: string): Uint8Array {
  if (s.length % 5 !== 0) throw new Error("Z85: string length must be multiple of 5");
  const out = new Uint8Array((s.length / 5) * 4);
  for (let i = 0; i < s.length; i += 5) {
    let v = 0;
    for (let j = 0; j < 5; j++) {
      v = v * 85 + (Z85_VALUES[s[i + j]] ?? 0);
    }
    out[(i / 5) * 4 + 0] = (v >>> 24) & 0xFF;
    out[(i / 5) * 4 + 1] = (v >>> 16) & 0xFF;
    out[(i / 5) * 4 + 2] = (v >>> 8) & 0xFF;
    out[(i / 5) * 4 + 3] = v & 0xFF;
  }
  return out;
}

// ---- getSubtle / getRandomBytes ----
async function getSubtle(): Promise<SubtleCrypto> {
  if (typeof globalThis !== "undefined" && (globalThis as any).crypto?.subtle) {
    return (globalThis as any).crypto.subtle as SubtleCrypto;
  }
  const nodeCrypto = await import("crypto");
  return nodeCrypto.webcrypto.subtle as unknown as SubtleCrypto;
}

async function getRandomBytes(n: number): Promise<Uint8Array> {
  if (typeof globalThis !== "undefined" && (globalThis as any).crypto?.getRandomValues) {
    const a = new Uint8Array(n);
    (globalThis as any).crypto.getRandomValues(a);
    return a;
  }
  const { randomBytes } = await import("crypto");
  return new Uint8Array(randomBytes(n));
}

// ---- PBKDF2 / AES key helpers ----
async function importKeyFromPassphrase(passphrase: string) {
  const subtle = await getSubtle();
  return subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase) as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
}

async function deriveAesKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = DEFAULT_ITERATIONS,
  keyLength = DEFAULT_KEYLEN
) {
  const subtle = await getSubtle();
  const passKey = await importKeyFromPassphrase(passphrase);
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength);
  return subtle.deriveKey(
    { name: "PBKDF2", salt: saltBuf as ArrayBuffer, iterations, hash: "SHA-256" },
    passKey,
    { name: "AES-GCM", length: keyLength },
    false,
    ["encrypt", "decrypt"]
  );
}

// ---- Encrypt / Decrypt ----
export async function encrypt(
  plain: string,
  passphrase: string,
  opts?: EncryptOptsProps
): Promise<string> {
  if (!passphrase) throw new Error("passphrase required");
  const iterations = opts?.iterations ?? DEFAULT_ITERATIONS;
  const keyBits = opts?.keyLength ?? DEFAULT_KEYLEN;

  const subtle = await getSubtle();
  const salt = await getRandomBytes(16);
  const iv = await getRandomBytes(12);
  const key = await deriveAesKey(passphrase, salt, iterations, keyBits);

  const cipherBuf = await subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as BufferSource },
    key,
    new TextEncoder().encode(plain) as BufferSource
  );

  // Z85 requires 4-byte multiple → padding
  let out = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(new Uint8Array(cipherBuf), salt.length + iv.length);

  // pad to multiple of 4
  const padLen = (4 - (out.length % 4)) % 4;
  if (padLen > 0) out = new Uint8Array([...out, ...new Uint8Array(padLen)]);

  return z85Encode(out);
}

export async function decrypt(cipherText: string, passphrase: string): Promise<string> {
  if (!passphrase) throw new Error("passphrase required");
  let allBytes = z85Decode(cipherText);

  // trim padding
  const expectedLen = allBytes.length - (allBytes.length % 4);
  if (allBytes.length > expectedLen) allBytes = allBytes.slice(0, expectedLen);

  if (allBytes.length < 16 + 12 + 1) throw new Error("ciphertext too short");

  const salt = allBytes.slice(0, 16);
  const iv = allBytes.slice(16, 28);
  const data = allBytes.slice(28);

  const key = await deriveAesKey(passphrase, salt);
  const subtle = await getSubtle();
  const plainBuf = await subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) },
    key,
    data
  );

  return new TextDecoder().decode(new Uint8Array(plainBuf));
}
