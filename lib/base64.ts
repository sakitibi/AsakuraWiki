import Pako from "pako";

/**
 * hex文字列をUTF-8文字列にする関数
 * @param hex
 */
export function hexToUtf8(hex:string):string | null{
    try {
        const bytes = hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16));
        return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    } catch (error) {
        console.error("Invalid hex string:", error);
        return null;
    }
}
/**
 * UTF-8文字列をhex文字列にする関数
 * @param utf8String
 */
export function utf8ToHex(utf8String:string):string | null {
    try {
        // Encode the string into a byte array
        const bytes = new TextEncoder().encode(utf8String);
        // Convert each byte to a two-character hex string
        return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error("Invalid UTF-8 string:", error);
        return null;
    }
}

export function encodeBase64Unicode(str:string):string {
    const bytes = new TextEncoder().encode(str); // UTF-8に変換
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary); // Base64エンコード
}

export function uint8ToBase64(u8: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < u8.length; i++) {
        binary += String.fromCharCode(u8[i]);
    }
    return btoa(binary);
}

export function base64ToUint8(b64: string): Uint8Array {
    const binary = atob(b64);
    const u8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        u8[i] = binary.charCodeAt(i);
    }
    return u8;
}

export function decodeBase64Unicode(str:string):string {
    const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

export function gzipAndBase64(str: string): string {
    const encoded = new TextEncoder().encode(str);   // string → Uint8Array
    const gzipped = Pako.gzip(encoded);               // gzip
    return uint8ToBase64(gzipped);                     // → base64
}

export function ungzipFromBase64(base64: string): string {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const decompressed = Pako.ungzip(bytes);
    return new TextDecoder().decode(decompressed);
}