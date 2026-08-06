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

async function encryptText(plainText:string, passphrase:string){
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = upack.SEncoder.encodeSEncode(encoded.buffer, passphrase);
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
        const passphrase = await upack.SEncoder.randomGenerate(
            Math.floor(Math.random() * 10) + 32,
            "_", "_入江由莉子_"
        );
        const passphraseFiltered = passphrase.replaceAll("_入江由莉子_", "_");

        const [emailenc, passenc, birthenc, userenc, countriesenc, genderenc, fullnameenc] = await Promise.all([
            encryptText(email, passphraseFiltered),
            encryptText(password, passphraseFiltered),
            encryptText(birthday, passphraseFiltered),
            encryptText(username, passphraseFiltered),
            encryptText(contries, passphraseFiltered),
            encryptText(gender, passphraseFiltered),
            encryptText(fullname, passphraseFiltered),
        ])

        const encryptedArray:string[] = [
            emailenc,
            passenc,
            birthenc,
            userenc,
            countriesenc,
            genderenc,
            fullnameenc,
            passphrase
        ];
        return encryptedArray;
    } catch(e:any){
        console.error("EncryptedError: ", e);
    }
}

export async function decryptV3(
    encrypted: string[],
    passphrase: string
): Promise<string[] | undefined> {
    const decryptedArray = [];
    for (let i = 0;i < encrypted.length;i++) {
        const decrypted = await upack.SEncoder.decodeSEncode(
            encrypted[i],
            passphrase.replaceAll("_入江由莉子_", "_"),
            true
        ) as string;
        decryptedArray.push(decrypted);
    }
    return decryptedArray;
}