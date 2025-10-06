// AES-GCM + PBKDF2 + Z85 (0x21–0x7E printable ASCII) 安全保存版
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
        const v = (data[i] << 24) | (data[i+1] << 16) | (data[i+2] << 8) | data[i+3];
        let div = 85 ** 4;
        for (let j = 0; j < 5; j++) {
            s += Z85_CHARS[Math.floor(v / div) % 85];
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
            const val = Z85_VALUES[s[i + j]];
            if (val === undefined) throw new Error(`Invalid Z85 char: ${s[i + j]}`);
            v = v * 85 + val;
        }
        out[(i/5)*4 + 0] = (v >>> 24) & 0xFF;
        out[(i/5)*4 + 1] = (v >>> 16) & 0xFF;
        out[(i/5)*4 + 2] = (v >>> 8) & 0xFF;
        out[(i/5)*4 + 3] = v & 0xFF;
    }
    return out;
}

// ---- SubtleCrypto helpers ----
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
            salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as BufferSource,
            iterations,
            hash: "SHA-256"
        },
        passKey,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
}

// ---- Encrypt / Decrypt ----
export async function encrypt(plain: string, passphrase: string, opts?: EncryptOptsProps): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");
    const iterations = opts?.iterations ?? DEFAULT_ITERATIONS;
    const keyBits = opts?.keyLength ?? DEFAULT_KEYLEN;

    const salt = getRandomBytes(16);
    const iv = getRandomBytes(12);
    const key = await deriveAesKey(passphrase, salt, iterations, keyBits);

    const cipherBuf = new Uint8Array(await getSubtle().encrypt(
        { name: "AES-GCM", iv:iv as BufferSource },
        key,
        new TextEncoder().encode(plain)
    ));

    // salt + iv + cipher
    let out = new Uint8Array(salt.length + iv.length + cipherBuf.length);
    out.set(salt, 0);
    out.set(iv, salt.length);
    out.set(cipherBuf, salt.length + iv.length);

    // 4 の倍数にパディング（0 で埋めるだけ）
    const padLen = (4 - (out.length % 4)) % 4;
    if (padLen > 0) {
        const padded = new Uint8Array(out.length + padLen);
        padded.set(out, 0);
        return z85Encode(padded);
    }

    return z85Encode(out);
}

export async function decrypt(cipherText: string, passphrase: string): Promise<string> {
    if (!passphrase) throw new Error("passphrase required");

    let allBytes = z85Decode(cipherText);

    // 後ろのパディング 0 を無視
    while (allBytes.length > 28 && allBytes[allBytes.length - 1] === 0) {
        allBytes = allBytes.slice(0, allBytes.length - 1);
    }

    if (allBytes.length < 16 + 12 + 1) throw new Error("ciphertext too short");

    const salt = allBytes.slice(0, 16);
    const iv = allBytes.slice(16, 28);
    const data = allBytes.slice(28);

    const key = await deriveAesKey(passphrase, salt);
    const plainBuf = await getSubtle().decrypt({ name: "AES-GCM", iv }, key, data);

    return new TextDecoder().decode(new Uint8Array(plainBuf));
}
