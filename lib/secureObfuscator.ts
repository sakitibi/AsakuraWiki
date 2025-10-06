// AES-GCM + PBKDF2 + Base64 安全保存版
const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_KEYLEN = 256;

function getSubtle(): SubtleCrypto {
    if (!globalThis.crypto?.subtle) throw new Error("SubtleCrypto not available");
    return globalThis.crypto.subtle;
}

function getRandomBytes(n: number): Uint8Array {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return a;
}

async function importKeyFromPassphrase(passphrase: string): Promise<CryptoKey> {
    return getSubtle().importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
}

async function deriveAesKey(passphrase: string, salt: Uint8Array, iterations = DEFAULT_ITERATIONS, keyLength = DEFAULT_KEYLEN): Promise<CryptoKey> {
    const passKey = await importKeyFromPassphrase(passphrase);
    return getSubtle().deriveKey(
        {
            name: "PBKDF2",
            salt:salt as BufferSource,
            iterations,
            hash: "SHA-256"
        },
        passKey,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buf);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
}

// ---- Encrypt / Decrypt ----
export async function encrypt(plain: string, passphrase: string): Promise<string> {
    const salt = getRandomBytes(16);
    const iv = getRandomBytes(12);
    const key = await deriveAesKey(passphrase, salt);

    const cipherBuf = await getSubtle().encrypt(
        { name: "AES-GCM", iv:iv as BufferSource },
        key,
        new TextEncoder().encode(plain ?? "")
    );

    const combined = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(cipherBuf), salt.length + iv.length);

    return arrayBufferToBase64(combined.buffer);
}

export async function decrypt(cipherText: string, passphrase: string): Promise<string> {
    const allBytes = new Uint8Array(base64ToArrayBuffer(cipherText));
    if (allBytes.length < 16 + 12) throw new Error("ciphertext too short");

    const salt = allBytes.slice(0, 16);
    const iv = allBytes.slice(16, 28);
    const data = allBytes.slice(28);

    const key = await deriveAesKey(passphrase, salt);
    const plainBuf = await getSubtle().decrypt({ name: "AES-GCM", iv }, key, data);

    return new TextDecoder().decode(plainBuf);
}
