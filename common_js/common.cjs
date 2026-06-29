const fs = require('fs');
const path = require('path');
const upack = require('../node_modules/upack.js/dist/cjs/index.cjs');
const { upack_js, pako } = require('./upack_template.cjs');
const zlib = require('zlib');

// 調べたいディレクトリの絶対パス
const dirPath = '/vercel/path0/.next/output/static/_next';
const dirPath2 = '/vercel/path0/.next/output';
const upackSecretKey = "AsakuraWiki";

function splitAtLastDoubleNewline(text) {
    const idx = text.lastIndexOf('\n\n');
    if (idx === -1) return [text, ''];
    return [text.slice(0, idx), text.slice(idx + 2)];
}

async function encrypt(FilePath) {
    try{
        const File = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/${FilePath}`)
        ).trim();
        const [headPart, tailPart] = splitAtLastDoubleNewline(File);
        const FileEncoded = await upack.SEncoder.encodeSEncode(
            new TextEncoder().encode(headPart),
            upackSecretKey,
            10
        );
        const compressedBuffer = zlib.gzipSync(FileEncoded, { level: zlib.constants.Z_BEST_COMPRESSION });

        const decimalArray = Array.from(compressedBuffer);

        const commaSeparatedDecimal = decimalArray.join(',');

        const FileJavascriptCode = `;${pako}\n${upack_js}\n
        ;(async function(){eval(await upack.SEncoder.decodeSEncode(pako.ungzip(new Uint8Array([${commaSeparatedDecimal}]), {to: "string"}), "${upackSecretKey}", true, 10))})();`;
        const FileJavascriptFullVersion = FileJavascriptCode + "\n\n" + tailPart;
        fs.writeFileSync(
            `${dirPath}/${FilePath}`,
            FileJavascriptFullVersion,
            {
                encoding: 'utf8',
                flag: 'w'
            }
        );
    } catch(e){
        console.error("Error", e);
    }
}

(async function(){
    try {
        const files = fs.readdirSync(`${dirPath}/static`);
        const files2 = new fs.readdirSync(`${dirPath2}`);
        console.log("files2: ", files2);
        const filtered = files.filter(value => value !== "chunks" && value !== "not-found.txt");
        const deployedFiles = fs.readdirSync(`${dirPath}/static/${filtered[0]}`);
        const buildManifestFile = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/static/${filtered[0]}/_buildManifest.js`)
        ).trim();
        const sliced = JSON.parse(buildManifestFile.slice(24, buildManifestFile.length - 55));
        const rootBase = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/${sliced["/"][0]}`)
        ).trim();
        const rootBaseParsed = JSON.parse(rootBase.slice(35, rootBase.length - 1));
        await encrypt(rootBaseParsed[0]);
        await encrypt(rootBaseParsed[1]);
        await encrypt(rootBaseParsed[2]);
    } catch (err) {
        console.error('エラーが発生しました:', err);
    }
})();