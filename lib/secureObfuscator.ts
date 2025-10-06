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
    const secureRandomStringArray:string[] = [
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10),
        secureRandomString(Math.floor(Math.random() * 11) + 10)
    ];
    const HexEncodedArray:string[] = [
        HexEncode(`${secureRandomStringArray[0]}<${email}`)!,
        HexEncode(`${secureRandomStringArray[1]}<${password}`)!,
        HexEncode(`${secureRandomStringArray[2]}<${birthday}`)!,
        HexEncode(`${secureRandomStringArray[3]}<${username}`)!
    ];
    console.log("HexEncodedArray: ", HexEncodedArray);
    const encryptedArray:string[] = [
        encodeBase64(HexEncodedArray[0]!),
        encodeBase64(HexEncodedArray[1]!),
        encodeBase64(HexEncodedArray[2]!),
        encodeBase64(HexEncodedArray[3]!),
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
