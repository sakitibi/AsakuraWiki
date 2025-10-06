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
    const randomStrArray:string[] = [
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
    ];
    const randomStr:string = JSON.stringify(randomStrArray);
    return [
        encodeBase64(HexEncode(randomStr.split("\",\"")[0] + "<" + email)!),
        encodeBase64(HexEncode(randomStr.split("\",\"")[1] + "<" + password)!),
        encodeBase64(HexEncode(randomStr.split("\",\"")[2] + "<" + birthday)!),
        encodeBase64(HexEncode(randomStr.split("\",\"")[3] + "<" + username)!),
    ];
}

export function decrypt(
    encrypted:string
): string {
    const decodeBase64Str = HexDecode(decodeBase64(encrypted))
    const plainStr:string = decodeBase64Str!.split("<")[1];
    return plainStr;
}
