const fs = require('fs');
const path = require('path');
const upack = require('./node_modules/upack.js/dist/cjs/index.cjs');

// 調べたいディレクトリの絶対パス
const dirPath = '/vercel/path0/.next/output/static/_next'; 
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
    console.log("indexHTMLFile1: ", indexHTMLFile1);
} catch (err) {
    console.error('エラーが発生しました:', err);
}