"use client"

import upack from '@/node_modules/upack.js/src/index';

export interface encryptedDataProps{
    salt: string;
    iv: string;
    iterations: number;
    tagLength: number;
    ciphertext: string;
}

// 正規表現でCookie値を取得
export function getCookieValueByRegex(key: string) {
    const match = document.cookie.match(new RegExp(`${key}=([^;]*)`));
    return match ? match[1] : null;
}

// 文字列から公開鍵を復元
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
    const buffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        "spki",
        buffer,
        { name: "ECDH", namedCurve: "P-256" },
        true,
        []
    );
}

// 文字列から秘密鍵を復元
export async function importPrivateKey(base64Key: string): Promise<CryptoKey> {
    const buffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        "pkcs8",
        buffer,
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey", "deriveBits"]
    );
}

async function encryptText(plainText:string){
    const encoded = new TextEncoder().encode(plainText);
    const passphrase = process.env.NEXT_PUBLIC_UPACK_B64KEYPAIR?.split(",")[0];
    const encrypted = upack.SEncoder.encodeSEncode(encoded.buffer, await importPublicKey(passphrase!), 0);
    return encrypted;
}

export function secureRandomString(length:number) {
    const characters = `!?"#$%&',._;:+\`[{}]-=@^~()/|\\abcdefghijklmnopqrstuvwxyz
    ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`.replaceAll(/[\n]|[    ]/gu, "");
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => characters[byte % characters.length]).join('');
}

// ---- Encrypt / Decrypt ----
export async function encrypt(
    email: string,
    password: string,
    birthday: string,
    username: string,
    contries: string,
    gender: string,
    fullname: string
): Promise<string[] | undefined> {
    try{
        const [emailenc, passenc, birthenc, userenc, countriesenc, genderenc, fullnameenc] = await Promise.all([
            encryptText(email),
            encryptText(password),
            encryptText(birthday),
            encryptText(username),
            encryptText(contries),
            encryptText(gender),
            encryptText(fullname),
        ])

        const encryptedArray:string[] = [
            emailenc,
            passenc,
            birthenc,
            userenc,
            countriesenc,
            genderenc,
            fullnameenc,
        ];
        return encryptedArray;
    } catch(e:any){
        console.error("EncryptedError: ", e);
    }
}

export async function decryptV3(
    encrypted: string[],
): Promise<string[] | undefined> {
    const decryptedArray = [];
    for (let i = 0;i < encrypted.length;i++) {
        const decrypted = await upack.SEncoder.decodeSEncode(
            encrypted[i],
            await importPrivateKey(process.env.NEXT_PUBLIC_UPACK_B64KEYPAIR?.split(",")[1]!),
            0,
            true
        ) as string;
        decryptedArray.push(decrypted);
    }
    return decryptedArray;
}