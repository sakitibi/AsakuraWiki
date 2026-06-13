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
} catch (err) {
    console.error('エラーが発生しました:', err);
}