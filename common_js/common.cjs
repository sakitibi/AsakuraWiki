const fs = require('fs');
const path = require('path');
const upack = require('../node_modules/upack.js/dist/cjs/index.cjs');
const { upack_js, pako } = require('./upack_template.cjs');
const zlib = require('zlib');

// 調べたいディレクトリの絶対パス
const dirPath = '/vercel/path0/.next/output/static/_next';
const upackSecretKey = "AsakuraWiki";

async function encrypt(FilePath) {
    const File = new TextDecoder().decode(
        fs.readFileSync(`${dirPath}/${FilePath}`)
    ).trim();
    const FileSplited = File.split("\n\n");
    const FileEncoded = await upack.SEncoder.encodeSEncode(
        new TextEncoder().encode(FileSplited[0]),
        upackSecretKey,
        10
    );
    const compressedBuffer = zlib.gzipSync(FileEncoded, { level: zlib.constants.Z_BEST_COMPRESSION });

    const decimalArray = Array.from(compressedBuffer);

    const commaSeparatedDecimal = decimalArray.join(',');

    const FileJavascriptCode = `${pako}${upack_js}
    (async function(){eval(new TextDecoder().decode(await upack.SEncoder.decodeSEncode(pako.ungzip(new Uint8Array([${commaSeparatedDecimal}]), {to: "string"})), "${upackSecretKey}", 10))})()`;
    const FileJavascriptFullVersion = FileJavascriptCode + "\n\n" + FileSplited[1];
    fs.writeFileSync(
        `${dirPath}/${FilePath}`,
        FileJavascriptFullVersion,
        {
            encoding: 'utf8',
            flag: 'w'
        }
    );
}

(async function(){
    try {
        const files = fs.readdirSync(`${dirPath}/static`);
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
        const indexHTMLFilePath1 = rootBaseParsed[0];
        await encrypt(indexHTMLFilePath1);
    } catch (err) {
        console.error('エラーが発生しました:', err);
    }
})();