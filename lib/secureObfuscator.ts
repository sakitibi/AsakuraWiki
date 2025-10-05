// /lib/secureObfuscator.ts
// Web Crypto (PBKDF2 + AES-GCM) を使い、安全に暗号化しつつ
// 出力を任意の CHARSET のみで表現するユーティリティ。
// TypeScript (Next.js) 向け — ブラウザと Node (Next API routes) の両対応。

const DEFAULT_CHARSET = "abcdefghijklmnopqrstuvwxyz@-_"; // 例
let CHARSET = DEFAULT_CHARSET;
let CHAR_IDX: Record<string, number> = buildIndex(CHARSET);

function buildIndex(cs: string) {
    const o: Record<string, number> = {};
    for (let i = 0; i < cs.length; i++) o[cs[i]] = i;
    return o;
}

export function setCharset(newCharset: string) {
    if (newCharset.length < 2) throw new Error("charset too short");
    CHARSET = newCharset;
    CHAR_IDX = buildIndex(CHARSET);
}

// ---------- helpers for environment (subtle & random) ----------
function getSubtle(): SubtleCrypto {
    // browser: globalThis.crypto.subtle
    // node >= 18: require('crypto').webcrypto.subtle
    // throw if not found
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto && (globalThis as any).crypto.subtle) {
        return (globalThis as any).crypto.subtle as SubtleCrypto;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodeCrypto = require("crypto");
        if (nodeCrypto && nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle) {
            return nodeCrypto.webcrypto.subtle as SubtleCrypto;
        }
    } catch (e) {
        /* ignore */
    }
    throw new Error("Web Crypto Subtle API is not available in this environment");
}

function getRandomBytes(n: number): Uint8Array {
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto && typeof (globalThis as any).crypto.getRandomValues === "function") {
        const a = new Uint8Array(n);
        (globalThis as any).crypto.getRandomValues(a);
        return a;
    }
    try {
        const nodeCrypto = require("crypto");
        return new Uint8Array(nodeCrypto.randomBytes(n));
    } catch (e) {
        // fallback to Math.random (very weak) — should not happen in Next.js runtime
        const a = new Uint8Array(n);
        for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
        return a;
    }
}

// ---------- small seeded hash (FNV-1a 32bit) used by randomizeCharset ----------
function fnv1a32(str: string) {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
}

// xorshift32 for deterministic shuffle
class XorShift32 {
    private s: number;
    constructor(seed: number) { this.s = seed >>> 0 || 1; }
    next() {
        let x = this.s;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.s = x >>> 0;
        return this.s;
    }
    nextMod(mod: number) { return this.next() % mod; }
}

// ---------- base-N bytes <-> CHARSET encoding (2 chars per byte) ----------
function assertCharsetSize() {
    const N = CHARSET.length;
    if (N * N < 256) throw new Error("charset too small: need N^2 >= 256");
}

function bytesToCharsetDigits(bytes: Uint8Array): string {
    assertCharsetSize();
    const N = CHARSET.length;
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        const hi = Math.floor(b / N);
        const lo = b % N;
        out += CHARSET[hi] + CHARSET[lo];
    }
    return out;
}

// ---------- Key derivation (PBKDF2) and AES-GCM encrypt/decrypt ----------
export type EncryptOptions = {
    iterations?: number; // PBKDF2 iterations
    keyLength?: 256 | 128; // AES key length bits
};

// Default: 200k iterations, AES-256
const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_KEYLEN = 256;

async function importKeyFromPassphrase(passphrase: string) {
    const subtle = getSubtle();
    const enc = new TextEncoder();
    return subtle.importKey("raw", enc.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
}

async function deriveAesKey(
    passphrase: string,
    salt: Uint8Array,
    iterations = DEFAULT_ITERATIONS,
    keyLength = DEFAULT_KEYLEN
) {
    const subtle = getSubtle();
    const passKey = await importKeyFromPassphrase(passphrase);

    // Uint8Array -> ArrayBuffer copy で型安全にする
    const saltBuf = new Uint8Array(salt).buffer;

    const derived = await subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuf,
            iterations,
            hash: "SHA-256",
        },
        passKey,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
    return derived;
}

// charset文字列 → Uint8Array に変換（encrypt の逆）
function bytesFromCharsetDigits(digits: string): Uint8Array{
    assertCharsetSize();
    const N = CHARSET.length;
    console.log("CHARSET length:", CHARSET.length);
    console.log("CHAR_IDX keys:", Object.keys(CHAR_IDX));

    if (digits.length % 2 !== 0) throw new Error("Invalid digit length");
    console.log("digits: ", digits);
    const bytes = new Uint8Array(digits.length / 2);

    for (let i = 0, j = 0; i < digits.length; i += 2, j++) {
        const hi = CHAR_IDX[digits[i]];
        const lo = CHAR_IDX[digits[i + 1]];

        if (hi === undefined || lo === undefined) throw new Error("Invalid charset digit");

        bytes[j] = hi * N + lo;
    }

    return bytes;
}

// encrypt: returns CHARSET-only string containing (salt16 + iv12 + ciphertext+tag)
export async function encrypt(
    plain: string,
    passphrase: string,
    opts?: EncryptOptions
): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");
    assertCharsetSize();

    const iterations = opts?.iterations ?? DEFAULT_ITERATIONS;
    const keyBits = opts?.keyLength ?? DEFAULT_KEYLEN;

    // salt (16 bytes) for PBKDF2
    const salt = getRandomBytes(16);
    const key = await deriveAesKey(passphrase, salt, iterations, keyBits);

    // iv for AES-GCM (12 bytes recommended)
    const iv = getRandomBytes(12);
    const ivBuf = iv.buffer as ArrayBuffer; // ← 明示的に ArrayBuffer にキャスト

    const subtle = getSubtle();
    const enc = new TextEncoder();
    const plainBuf = enc.encode(plain);

    // ✅ iv は Uint8Array のまま渡す
    const cipherBuf = await subtle.encrypt({ name: "AES-GCM", iv: ivBuf }, key, plainBuf);

    // construct output bytes: salt(16) || iv(12) || cipher(...)
    const cbytes = new Uint8Array(cipherBuf);
    const outBytes = new Uint8Array(salt.length + iv.length + cbytes.length);
    outBytes.set(salt, 0);
    outBytes.set(iv, salt.length);
    outBytes.set(cbytes, salt.length + iv.length);

    // encode to CHARSET digits
    return bytesToCharsetDigits(outBytes);
}

// decrypt: expects already Base64-decoded string (binary data as string)
export async function decrypt(
    cipherText: string, // すでに Base64 → CHARSET 文字列に変換済み
    passphrase: string,
    opts?: EncryptOptions
): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");
    assertCharsetSize();
    console.log("cipherText: ", cipherText);

    const iterations = opts?.iterations ?? DEFAULT_ITERATIONS;
    const keyBits = opts?.keyLength ?? DEFAULT_KEYLEN;

    // CHARSET文字列 → Uint8Array に変換
    const allBytes = bytesFromCharsetDigits(cipherText);
    console.log("digits to decode:", cipherText.split("").filter(c => !CHAR_IDX[c]));

    if (allBytes!.length < 16 + 12 + 1) {
        throw new Error("ciphertext too short");
    }

    const salt = allBytes!.slice(0, 16);
    const iv = allBytes!.slice(16, 28);
    const cbytes = allBytes!.slice(28);

    const key = await deriveAesKey(passphrase, salt, iterations, keyBits);
    console.log("key: ", key);
    const subtle = getSubtle();

    // iv は Uint8Array でも ArrayBuffer でもOKなので安全に渡す
    const plainBuf = await subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        cbytes
    );
    console.log("plainBuf: ", plainBuf);
    const dec = new TextDecoder();
    return dec.decode(new Uint8Array(plainBuf));
}

// deterministic charset randomize (same seed -> same permutation)
export function randomizeCharset(seedPhrase: string) {
    const base = DEFAULT_CHARSET.split("");
    const seed = fnv1a32(seedPhrase);
    const prng = new XorShift32(seed || 1);
    for (let i = base.length - 1; i > 0; i--) {
        const j = prng.nextMod(i + 1);
        const tmp = base[i];
        base[i] = base[j];
        base[j] = tmp;
    }
    setCharset(base.join(""));
}
