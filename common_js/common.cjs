const fs = require('fs');
const upack = require('../node_modules/upack.js/dist/cjs/index.cjs');
const { upack_js, pako } = require('./upack_template.cjs');
const zlib = require('zlib');

const dirPath = '/vercel/path0/.next/output/static/_next';
//const dirPath2 = '/vercel/path0/.next/static';

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
        console.log(`[DEBUG] encrypt開始: ${FilePath}`);
        const KeyPair = await upack.SEncoder.generateKeyPair();
        const PrivateKeyB64 = await exportPrivateKey(KeyPair.privateKey);

        const fullPath = `${dirPath}/${FilePath}`;
        console.log(`[DEBUG] ファイル読み込み中: ${fullPath}`);
        const File = new TextDecoder().decode(
            fs.readFileSync(fullPath)
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
        
        console.log(`[DEBUG] ファイル書き込み中: ${fullPath}`);
        fs.writeFileSync(
            fullPath,
            FileJavascriptFullVersion,
            { encoding: 'utf8', flag: 'w' }
        );
        console.log(`[DEBUG] encrypt完了: ${FilePath}`);
    } catch(e){
        console.error("[ERROR in encrypt]", e);
    }
}

(async function(){
    try {
        console.log("[DEBUG] スクリプト実行開始");
        console.log("[DEBUG] dirPathクエリ確認:", dirPath);

        if (!fs.existsSync(dirPath)) {
            console.error("[ERROR] dirPathが存在しません:", dirPath);
            return;
        }

        const files = fs.readdirSync(`${dirPath}/static`);
        console.log("[DEBUG] static読み込み成功, files件数:", files.length);

        const filtered = files.filter(value => value !== "immutable" && value !== "not-found.txt");
        console.log("[DEBUG] filtered[0]:", filtered[0]);

        const buildManifestPath = `${dirPath}/static/${filtered[0]}/_buildManifest.js`;
        console.log("[DEBUG] _buildManifest.js読み込みパス:", buildManifestPath);
        
        const buildManifestFile = new TextDecoder().decode(
            fs.readFileSync(buildManifestPath)
        ).trim();
        
        const sliced = JSON.parse(
            buildManifestFile.slice(
                24,
                buildManifestFile.indexOf("self.__TURBOPACK_PAGE_BOOTSTRAP") - 1
            )
        );
        
        const rootPath = `${dirPath}/${sliced["/"][0]}`;
        console.log("[DEBUG] rootPath:", rootPath);

        const rootBase = new TextDecoder().decode(
            fs.readFileSync(rootPath)
        ).trim();
        
        const rootBaseParsed =
            JSON.parse(rootBase.slice(35, rootBase.length - 1)).filter(value => value.endsWith(".js"));

        const targets = rootBaseParsed.slice(0, Object.keys(rootBaseParsed).length - 1);
        console.log("[DEBUG] ターゲットファイル数:", targets.length);

        for (const item of targets) {
            await encrypt(item);
        }
        
        console.log("すべての暗号化が完了しました");
    } catch (err) {
        console.error('[ERROR in Main]', err);
        process.exit(1);
    }
})();