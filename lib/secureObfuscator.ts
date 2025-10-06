// /lib/secureObfuscator.ts
// Web Crypto (PBKDF2 + AES-GCM) を使い、安全に暗号化しつつ
// 出力を任意の CHARSET のみで表現するユーティリティ。
// TypeScript (Next.js) 向け — ブラウザと Node (Next API routes) の両対応。

// ---------- CHARSET (可視文字のみ) ----------
const DEFAULT_CHARSET = `0123456789abcdefghijklmnopqrstuvwxyz
    ABCDEFGHIJKLMNOPQRSTUVWXYZ@-_.,{[]}:;^~|=!"#$%&'()<>?/\\\`*+`.replace(/\t\n/gu, "");
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
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto?.subtle) {
        return (globalThis as any).crypto.subtle as SubtleCrypto;
    }
    try {
        const nodeCrypto = require("crypto");
        if (nodeCrypto?.webcrypto?.subtle) return nodeCrypto.webcrypto.subtle as SubtleCrypto;
    } catch {}
    throw new Error("Web Crypto Subtle API is not available in this environment");
}

function getRandomBytes(n: number): Uint8Array {
    if (typeof globalThis !== "undefined" && typeof (globalThis as any).crypto?.getRandomValues === "function") {
        const a = new Uint8Array(n);
        (globalThis as any).crypto.getRandomValues(a);
        return a;
    }
    try {
        const nodeCrypto = require("crypto");
        return new Uint8Array(nodeCrypto.randomBytes(n));
    } catch {
        const a = new Uint8Array(n);
        for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
        return a;
    }
}

// ---------- small seeded hash (FNV-1a 32bit) ----------
function fnv1a32(str: string) {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
}

// ---------- deterministic shuffle (xorshift32) ----------
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

// ---------- base-N bytes <-> CHARSET ----------
function assertCharsetSize() {
    const N = CHARSET.length;
    if (N * N < 256) throw new Error("charset too small: need N^2 >= 256");
}

function bytesToCharsetDigits(bytes: Uint8Array): string {
    assertCharsetSize();
    const N = CHARSET.length;
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        const hi = Math.floor(bytes[i] / N);
        const lo = bytes[i] % N;
        out += CHARSET[hi] + CHARSET[lo];
    }
    return out;
}

function bytesFromCharsetDigits(digits: string): Uint8Array {
    assertCharsetSize();
    const N = CHARSET.length;

    if (digits.length % 2 !== 0) throw new Error("Invalid digit length");
    const bytes = new Uint8Array(digits.length / 2);

    for (let i = 0, j = 0; i < digits.length; i += 2, j++) {
        const hi = CHAR_IDX[digits[i]];
        const lo = CHAR_IDX[digits[i + 1]];
        if (hi === undefined || lo === undefined) throw new Error("Invalid charset digit");
        bytes[j] = hi * N + lo;
    }

    return bytes;
}

// ---------- Key derivation (PBKDF2) and AES-GCM ----------
export type EncryptOptions = {
    iterations?: number;
    keyLength?: 256 | 128;
};
const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_KEYLEN = 256;

async function importKeyFromPassphrase(passphrase: string) {
    const subtle = getSubtle();
    const enc = new TextEncoder();
    return subtle.importKey("raw", enc.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
}

async function deriveAesKey(passphrase: string, salt: Uint8Array, iterations = DEFAULT_ITERATIONS, keyLength = DEFAULT_KEYLEN) {
    const subtle = getSubtle();
    const passKey = await importKeyFromPassphrase(passphrase);
    const saltBuf = salt.buffer as ArrayBuffer;
    return subtle.deriveKey(
        { name: "PBKDF2", salt: saltBuf, iterations, hash: "SHA-256" },
        passKey,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
}

// ---------- encrypt / decrypt ----------
export async function encrypt(plain: string, passphrase: string, opts?: EncryptOptions): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");
    assertCharsetSize();

    const salt = getRandomBytes(16);
    const key = await deriveAesKey(passphrase, salt, opts?.iterations, opts?.keyLength);
    const iv = getRandomBytes(12);
    const ivBuf = iv as BufferSource;
    const plainBuf = new TextEncoder().encode(plain);
    const cipherBuf = await getSubtle().encrypt({ name: "AES-GCM", iv: ivBuf }, key, plainBuf);

    const outBytes = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
    outBytes.set(salt, 0);
    outBytes.set(iv, salt.length);
    outBytes.set(new Uint8Array(cipherBuf), salt.length + iv.length);

    return bytesToCharsetDigits(outBytes);
}

export async function decrypt(cipherText: string, passphrase: string, opts?: EncryptOptions): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");
    assertCharsetSize();

    const allBytes = bytesFromCharsetDigits(cipherText);
    if (allBytes.length < 16 + 12 + 1) throw new Error("ciphertext too short");

    const salt = allBytes.slice(0, 16);
    const iv = allBytes.slice(16, 28);
    const cbytes = allBytes.slice(28);

    const key = await deriveAesKey(passphrase, salt, opts?.iterations, opts?.keyLength);
    const plainBuf = await getSubtle().decrypt({ name: "AES-GCM", iv }, key, cbytes);

    return new TextDecoder().decode(new Uint8Array(plainBuf));
}

// ---------- deterministic charset randomize ----------
export function randomizeCharset(seedPhrase: string) {
    const base = DEFAULT_CHARSET.split("");
    const seed = fnv1a32(seedPhrase);
    const prng = new XorShift32(seed || 1);
    for (let i = base.length - 1; i > 0; i--) {
        const j = prng.nextMod(i + 1);
        [base[i], base[j]] = [base[j], base[i]];
    }
    setCharset(base.join(""));
}
