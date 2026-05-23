"use client"

import upack from "upack.js";

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

const b64ToBuf = (b64:string) => Uint8Array.from(atob(b64), c=>c.charCodeAt(0));

async function deriveKeyFromPassphrase(passphrase:string, salt:ArrayBuffer, iterations:number, keyLen=256) {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256'},
        baseKey,
        { name: 'AES-GCM', length: keyLen },
        false,
        ['encrypt','decrypt']
    );
}

function randomBytes(n:any){
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return a;
}

async function encryptText(plainText:string, passphrase:string){
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = upack.SEncoder.encodeSEncode(encoded.buffer, passphrase);
    return encrypted;
}

async function decryptObject(obj:encryptedDataProps, passphrase:string){
    const dec = new TextDecoder();
    try{
        const salt = b64ToBuf(obj.salt);
        const iv = b64ToBuf(obj.iv);
        const iterations = Number(obj.iterations) || 100000;
        const tagLength = Number(obj.tagLength) || 128;
        const ct = b64ToBuf(obj.ciphertext).buffer;
        const key = await deriveKeyFromPassphrase(passphrase, salt as any, iterations);
        const plainBuf = await crypto.subtle.decrypt({name:'AES-GCM', iv, tagLength: tagLength}, key, ct);
        return dec.decode(plainBuf);
    }catch(e:any){
        throw new Error('復号に失敗しました: ' + e.message);
    }
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
    shimei: string
): Promise<string[] | undefined> {
    try{
        const passphrase = upack.SEncoder.randomGenerate(
            Math.floor(Math.random() * 10) + 32,
            "_", "_入江由莉子_"
        );
        const encryptedArray:string[] = [
            await encryptText(email, passphrase),
            await encryptText(password, passphrase),
            await encryptText(birthday, passphrase),
            await encryptText(username, passphrase),
            await encryptText(contries, passphrase),
            await encryptText(gender, passphrase),
            await encryptText(shimei, passphrase),
            passphrase
        ];
        console.log("encryptedArray: ", encryptedArray);
        return encryptedArray;
    } catch(e:any){
        console.error("EncryptedError: ", e);
    }
}

export async function decryptV2(
    encrypted: encryptedDataProps[],
    passphrase: string
): Promise<string[] | undefined> {
    try{
        let decrypted:string[] = [];
        for(let i = 0; i < encrypted.length;i++){
            decrypted!.push(await decryptObject(encrypted[i], passphrase));
        }
        console.log("decrypted: ", decrypted);
        return decrypted;
    } catch(e){
        console.error("DecryptV2Error: ", e);
        return;
    }
}

export function decryptV3(
    encrypted: string[],
    passphrase: string
): string[] | undefined {
    const decryptedArray = [];
    for (let i = 0;i < encrypted.length;i++) {
        const decrypted = upack.SEncoder.decodeSEncode(
            encrypted[i],
            passphrase.replaceAll("_入江由莉子_", "_")
        );
        decryptedArray.push(new TextDecoder().decode(decrypted));
    }
    return decryptedArray;
}