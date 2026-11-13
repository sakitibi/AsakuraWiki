const fs = require('fs');
const upack = require('../node_modules/upack.js/dist/cjs/index.cjs');
const { upack_js, pako } = require('./upack_template.cjs');
const zlib = require('zlib');

const dirPath = '/vercel/path0/.next/output/static/_next';
const dirPath2 = '/vercel/path0/.next/static';

function splitAtLastDoubleNewline(text) {
    const idx = text.lastIndexOf('\n\n');
    if (idx === -1) return [text, ''];
    return [text.slice(0, idx), text.slice(idx + 2)];
}

async function exportPrivateKey(key) {
    const exported = await crypto.subtle.exportKey("pkcs8", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

async function encrypt(FilePath) {
    try {
        const KeyPair = await upack.SEncoder.generateKeyPair();
        const PrivateKeyB64 = await exportPrivateKey(KeyPair.privateKey);

        const File = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/${FilePath}`)
        ).trim();
        const [headPart, tailPart] = splitAtLastDoubleNewline(File);
        const FileEncoded = await upack.SEncoder.encodeSEncode(
            new TextEncoder().encode(headPart),
            KeyPair.publicKey,
            10
        );
        const compressedBuffer = zlib.gzipSync(FileEncoded, { level: zlib.constants.Z_BEST_COMPRESSION });

        const decimalArray = Array.from(compressedBuffer);
        const commaSeparatedDecimal = decimalArray.join(',');

        const FileJavascriptCode = `;${pako}\n${upack_js}\n
        ;(async function(){async function importPrivateKey(e){const r=Uint8Array.from(atob(e),e=>e.charCodeAt(0));return await crypto.subtle.importKey("pkcs8",r,{name:"ECDH",namedCurve:"P-256"},!0,["deriveKey","deriveBits"])};
        eval(await upack.SEncoder.decodeSEncode(pako.ungzip(new Uint8Array([${commaSeparatedDecimal}]),{toText:true}), await importPrivateKey("${PrivateKeyB64}"), 10, true))})();`;
        const FileJavascriptFullVersion = FileJavascriptCode + "\n\n" + tailPart;
        console.log(`filePath: ${dirPath}/${FilePath}`);
        
        fs.writeFileSync(
            `${dirPath}/${FilePath}`,
            FileJavascriptFullVersion,
            { encoding: 'utf8', flag: 'w' }
        );
    } catch(e){
        console.error("Error", e);
    }
}

(async function(){
    try {
        const files = fs.readdirSync(`${dirPath}/static`);
        const files2 = fs.readdirSync(`${dirPath2}`);
        console.log("files2: ", files2);
        const filtered = files.filter(value => value !== "immutable" && value !== "not-found.txt");
        const buildManifestFile = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/static/${filtered[0]}/_buildManifest.js`)
        ).trim();
        const sliced = JSON.parse(
            buildManifestFile.slice(
                24,
                buildManifestFile.indexOf("self.__TURBOPACK_PAGE_BOOTSTRAP") - 1
            )
        );
        const rootBase = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/${sliced["/"][0]}`)
        ).trim();
        const rootBaseParsed =
            JSON.parse(rootBase.slice(35, rootBase.length - 1)).filter(value => value.endsWith(".js"));

        const targets = rootBaseParsed.slice(0, Object.keys(rootBaseParsed).length - 1);
        
        for (const item of targets) {
            await encrypt(item);
        }
        
        console.log("すべての暗号化が完了しました");
    } catch (err) {
        console.error('エラーが発生しました:', err);
        process.exit(1);
    }
})();