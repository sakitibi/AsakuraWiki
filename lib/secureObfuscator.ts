// /lib/secureObfuscator.ts
// AES-GCM + PBKDF2 (No Base64 / No CHARSET)
// 出力はバイナリを String.fromCharCode() 風にした文字列（安全なチャンク実装）

interface encryptOptsProps{
    iterations?: number;
    keyLength?: 256 | 128;
}

// ---- getSubtle / getRandomBytes (ESM-safe) ----
async function getSubtle(): Promise<SubtleCrypto> {
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto?.subtle) {
        return (globalThis as any).crypto.subtle as SubtleCrypto;
    }
    const nodeCrypto = await import("crypto");
    return (nodeCrypto.webcrypto?.subtle as unknown) as SubtleCrypto;
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
const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_KEYLEN = 256;

async function importKeyFromPassphrase(passphrase: string) {
    const subtle = await getSubtle();
    const enc = new TextEncoder();
    return subtle.importKey("raw", enc.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
}

async function deriveAesKey(
    passphrase: string,
    salt: Uint8Array,
    iterations = 200_000,
    keyLength = 256
) {
    const subtle = await getSubtle();
    const passKey = await importKeyFromPassphrase(passphrase);

    // Uint8Array を ArrayBuffer に変換して渡す
    const saltBuffer: ArrayBuffer | SharedArrayBuffer = salt.buffer.slice(
        salt.byteOffset,
        salt.byteOffset + salt.byteLength
    );

    return subtle.deriveKey(
        {
        name: "PBKDF2",
        salt: saltBuffer as ArrayBuffer,
        iterations,
        hash: "SHA-256",
        },
        passKey,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
}

// ---- Utility: chunked Uint8Array ⇄ binary string (safe for large buffers) ----
const CHUNK_SIZE = 0x8000; // 32KB-ish; safe for Function.apply limits

function bytesToBinaryString(bytes: Uint8Array): string {
    // chunked conversion to avoid call-stack / arguments limits
    let result = "";
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(i, i + CHUNK_SIZE);
        // Using fromCharCode on each chunk
        result += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return result;
}

function binaryStringToBytes(s: string): Uint8Array {
    const len = s.length;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = s.charCodeAt(i);
    return out;
}

// ---- Encrypt / Decrypt ----
export async function encrypt(
    plain: string,
    passphrase: string,
    opts?: encryptOptsProps
): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");

    const iterations = opts?.iterations ?? DEFAULT_ITERATIONS;
    const keyBits = opts?.keyLength ?? DEFAULT_KEYLEN;

    const subtle = await getSubtle();
    const salt = await getRandomBytes(16);
    const key = await deriveAesKey(passphrase, salt, iterations, keyBits);
    const iv = await getRandomBytes(12);
    const plainBuf = new TextEncoder().encode(plain);

    const cipherBuf = await subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer },
    key,
    new TextEncoder().encode(plain)
    );
    const cbytes = new Uint8Array(cipherBuf);

    const out = new Uint8Array(salt.length + iv.length + cbytes.length);
    out.set(salt, 0);
    out.set(iv, salt.length);
    out.set(cbytes, salt.length + iv.length);

    // safe chunked conversion
    return bytesToBinaryString(out);
}

export async function decrypt(cipherText: string, passphrase: string): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");

    const allBytes = binaryStringToBytes(cipherText);
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
