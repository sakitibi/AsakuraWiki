"use client"

import {
    encodeBase64Unicode as encodeBase64,
    decodeBase64Unicode as decodeBase64,
    utf8ToHex as HexDecode,
    hexToUtf8 as HexEncode
} from "@/lib/base64";

function secureRandomString(length:number) {
    const characters = `!?"#$%&',._;:+\`[{}]-=@^~()/|\\abcdefghijklmnopqrstuvwxyz
    ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`.replace(/\n\t/gu, "");
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => characters[byte % characters.length]).join('');
}
// ---- Encrypt / Decrypt ----
export function encrypt(
    email: string,
    password: string,
    birthday: string,
    username: string
): string[] {
    const encryptedArray = [
        encodeBase64(HexEncode(
            secureRandomString(Math.floor(Math.random() * 11) + 10) + "<" + email
        )!),
        encodeBase64(HexEncode(
            secureRandomString(Math.floor(Math.random() * 11) + 10) + "<" + password
        )!),
        encodeBase64(HexEncode(
            secureRandomString(Math.floor(Math.random() * 11) + 10) + "<" + birthday
        )!),
        encodeBase64(HexEncode(
            secureRandomString(Math.floor(Math.random() * 11) + 10) + "<" + username
        )!),
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
