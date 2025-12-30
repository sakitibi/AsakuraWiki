"use client"

import {
    decodeBase64Unicode as decodeBase64,
    hexToUtf8 as HexDecode
} from "@/lib/base64";

interface encryptedDataProps{
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
const bufToB64 = (buf:string) => btoa(String.fromCharCode(...new Uint8Array(buf as any)));

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

async function encryptText(plainText:string, passphrase:string, iterations:number, tagLength:number){
    const enc = new TextEncoder();
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = await deriveKeyFromPassphrase(passphrase, salt as any, iterations);
    const ct = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: tagLength },
        key,
        enc.encode(plainText)
    );
    return {
        salt: bufToB64(salt as any),
        iv: bufToB64(iv as any),
        iterations: iterations,
        tagLength: tagLength,
        ciphertext: bufToB64(ct as any)
    };
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
    jender: string,
    shimei: string
): Promise<string | undefined> {
    try{
        const encryptedArray:encryptedDataProps[] = [
            await encryptText(email, email, 100000, 128),
            await encryptText(password, email, 100000, 128),
            await encryptText(birthday, email, 100000, 128),
            await encryptText(username, email, 100000, 128),
            await encryptText(contries, email, 100000, 128),
            await encryptText(jender, email, 100000, 128),
            await encryptText(shimei, email, 100000, 128),
        ];
        console.log("encryptedArray: ", encryptedArray);
        return JSON.stringify(encryptedArray.map((data) => {
            return JSON.stringify(data);
        }) + email);
    } catch(e:any){
        console.error("EncryptedError: ", e);
    }
}

export function decrypt(
    encrypted:string
): string {
    try{
        const decodeBase64Str = HexDecode(decodeBase64(encrypted))
        console.log("decodeBase64Str: ", decodeBase64Str);
        const plainStr:string = decodeBase64Str!.split("<")[1];
        console.log("plainStr: ", plainStr)
        return plainStr;
    } catch(e:any){
        console.error("error: ", e);
        return String(e)
    }
}

export async function decryptV2(
    encrypted: string
){
    try{
        const encryptedArray = encrypted.split('^');
        const decrypted = await decryptObject(JSON.parse(encryptedArray[1]), encryptedArray[0]);
        console.log("decrypted: ", decrypted);
        return decrypted
    } catch(e){
        console.error("Error: ", e);
        return;
    }
}