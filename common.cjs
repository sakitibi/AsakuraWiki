const fs = require('fs');
const path = require('path');
const upack = require('./node_modules/upack.js/dist/cjs/index.cjs');

// 調べたいディレクトリの絶対パス
const dirPath = '/vercel/path0/.next/output/static/_next/static'; 
//const dirPath = '/vercel/path0/.next/output/static/_next/static/chunks'; 

try {
    const files = fs.readdirSync(dirPath);
    console.log("files: ", files);
    const filtered = files.filter(value => value !== "chunks" && value !== "not-found.txt");
    const deployedFiles = fs.readdirSync(`${dirPath}/${filtered[0]}`);
    console.log("deployedFiles: ", deployedFiles);
    const buildManifestFile = new TextDecoder().decode(
        fs.readFileSync(`${dirPath}/${filtered[0]}/_buildManifest.js`)
    );
    const sliced = buildManifestFile.slice(24, buildManifestFile.length - 55);
    console.log(sliced);
} catch (err) {
    console.error('エラーが発生しました:', err);
}