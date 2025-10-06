// /lib/secureObfuscator.ts
// AES-GCM + PBKDF2 (No Base64 / No CHARSET)
// 出力は printable ASCII のみ（0x21〜0x7E）、安全なチャンク実装

interface EncryptOptsProps {
  iterations?: number;
  keyLength?: 256 | 128;
}

const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_KEYLEN = 256;
const CHUNK_SIZE = 0x8000; // 32KB-ish

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
    new TextEncoder().encode(passphrase),
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

    // Uint8Array を ArrayBuffer に変換
    const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength);

    return subtle.deriveKey(
        { name: "PBKDF2", salt: saltBuf as BufferSource, iterations, hash: "SHA-256" },
        passKey,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
}

// ---- Utility: Uint8Array ⇄ printable ASCII (0x21〜0x7E) ----
function bytesToPrintableAscii(bytes: Uint8Array): string {
    const offset = 0x21;
    const range = 0x7E - 0x21 + 1;
    let s = "";
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(i, i + CHUNK_SIZE);
        const arr = Array.from(chunk, b => String.fromCharCode(offset + (b % range)));
        s += arr.join("");
    }
    return s;
}

function printableAsciiToBytes(s: string): Uint8Array {
    const offset = 0x21;
    const range = 0x7E - 0x21 + 1;
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = (s.charCodeAt(i) - offset) % range;
    return a;
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
    const key = await deriveAesKey(passphrase, salt, iterations, keyBits);
    const iv = await getRandomBytes(12);

    const cipherBuf = await subtle.encrypt(
        { name: "AES-GCM", iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer },
        key,
        new TextEncoder().encode(plain)
    );

    const out = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
    out.set(salt, 0);
    out.set(iv, salt.length);
    out.set(new Uint8Array(cipherBuf), salt.length + iv.length);

    return bytesToPrintableAscii(out);
}

export async function decrypt(cipherText: string, passphrase: string): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");

    const allBytes = printableAsciiToBytes(cipherText);
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
