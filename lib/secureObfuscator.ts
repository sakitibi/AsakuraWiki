"use client"

import {
    encodeBase64Unicode as encodeBase64,
    decodeBase64Unicode as decodeBase64,
    utf8ToHex as HexEncode,
    hexToUtf8 as HexDecode
} from "@/lib/base64";

// 正規表現でCookie値を取得
export function getCookieValueByRegex(key: string) {
    const match = document.cookie.match(new RegExp(`${key}=([^;]*)`));
    return match ? match[1] : null;
}

export function secureRandomString(length:number) {
    const characters = `!?"#$%&',._;:+\`[{}]-=@^~()/|\\abcdefghijklmnopqrstuvwxyz
    ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`.replaceAll(/[\n]|[    ]/gu, "");
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => characters[byte % characters.length]).join('');
}
// ---- Encrypt / Decrypt ----
export function encrypt(
    email: string,
    password: string,
    birthday: string,
    username: string,
    contries: string,
    jender: string,
    shimei: string
): string[] {
    const secureRandomStringArray:string[] = [
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10)
    ];
    console.log("secureRandomStringArray: ", secureRandomStringArray);
    const HexEncodedArray:string[] = [
        HexEncode(`${secureRandomStringArray[0]}<${email}`)!,
        HexEncode(`${secureRandomStringArray[1]}<${password}`)!,
        HexEncode(`${secureRandomStringArray[2]}<${birthday}`)!,
        HexEncode(`${secureRandomStringArray[3]}<${username}`)!,
        HexEncode(`${secureRandomStringArray[4]}<${contries}`)!,
        HexEncode(`${secureRandomStringArray[5]}<${jender}`)!,
        HexEncode(`${secureRandomStringArray[6]}<${shimei}`)!
    ];
    console.log("HexEncodedArray: ", HexEncodedArray);
    const encryptedArray:string[] = [
        encodeBase64(HexEncodedArray[0]!),
        encodeBase64(HexEncodedArray[1]!),
        encodeBase64(HexEncodedArray[2]!),
        encodeBase64(HexEncodedArray[3]!),
        encodeBase64(HexEncodedArray[4]!),
        encodeBase64(HexEncodedArray[5]!),
        encodeBase64(HexEncodedArray[6]!)
    ];
    console.log("encryptedArray: ", encryptedArray);
    return encryptedArray;
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
