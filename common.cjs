const fs = require('fs');
const path = require('path');
const upack = require('./node_modules/upack.js/dist/cjs/index.cjs');

// 調べたいディレクトリの絶対パス
const dirPath = '/vercel/path0/.next/output/static/_next/static'; 
try {
    const files = fs.readdirSync(dirPath);
    const filtered = files.filter(value => value !== "chunks" && value !== "not-found.txt");
    const deployedFiles = fs.readdirSync(`${dirPath}/${filtered[0]}`);
    const buildManifestFile = new TextDecoder().decode(
        fs.readFileSync(`${dirPath}/${filtered[0]}/_buildManifest.js`)
    );
    const sliced = JSON.parse(buildManifestFile.slice(24, buildManifestFile.length - 55));
    const rootBase = new TextDecoder().decode(
        fs.readFileSync(`/vercel/path0/.next/output/static/_next/${sliced["/"][0]}`)
    );
    const rootBaseParsed = JSON.parse(rootBase.slice(35, rootBase.length - 1));
    console.log("rootBase: ", rootBase);
} catch (err) {
    console.error('エラーが発生しました:', err);
}