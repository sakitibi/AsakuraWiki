const fs = require('fs');
const path = require('path');
const upack = require('./node_modules/upack.js/dist/cjs/index.cjs');
const upack_js = require('./upack_template.cjs');

(async function(){
    // 調べたいディレクトリの絶対パス
    const dirPath = '/vercel/path0/.next/output/static/_next';
    const upackSecretKey = "AsakuraWiki";
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
        const indexHTMLFile1 = new TextDecoder().decode(
            fs.readFileSync(`${dirPath}/${indexHTMLFilePath1}`)
        ).trim();
        const indexHTMLFile1Splited = indexHTMLFile1.split("\n\n");
        const indexHTMLFile1Encoded = await upack.SEncoder.encodeSEncode(
            new TextEncoder().encode(indexHTMLFile1Splited[0]),
            upackSecretKey,
            10
        );
        const indexHTMLFile1JavascriptCode = `${upack_js}
        (async function(){eval(new TextDecoder().decode(await upack.SEncoder.decodeSEncode("${indexHTMLFile1Encoded}", "${upackSecretKey}", 10)))})()`;
        const indexHTMLFile1JavascriptFullVersion = indexHTMLFile1JavascriptCode + "\n\n" + indexHTMLFile1Splited[1];
        fs.writeFileSync(
            `${dirPath}/${indexHTMLFilePath1}`,
            indexHTMLFile1JavascriptFullVersion,
            {
                encoding: 'utf8',
                flag: 'w'
            }
        );
    } catch (err) {
        console.error('エラーが発生しました:', err);
    }
})();