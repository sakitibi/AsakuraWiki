const fs = require('fs');
const path = require('path');
const upack = require('./node_modules/upack.js/dist/cjs/index.cjs');

// 調べたいディレクトリの絶対パス
const dirPath = '/vercel/path0/.next/output/static/_next'; 

try {
    const files = fs.readdirSync(dirPath);
    console.log(files); 
} catch (err) {
    console.error('エラーが発生しました:', err);
}