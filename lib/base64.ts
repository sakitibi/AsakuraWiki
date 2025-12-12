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

export function decodeBase64Unicode(str:string):string {
    const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}