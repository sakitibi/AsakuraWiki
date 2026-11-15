const upack = require('upack.js/dist/cjs/index.cjs');
const { upack_js, pako } = require('./common_js/upack_template.cjs');
const zlib = require('zlib');
const { crypto } = globalThis.crypto ? globalThis : { crypto: require('crypto').webcrypto };
/** @type {import('next').NextConfig} */

function splitAtLastDoubleNewline(text) {
    const idx = text.lastIndexOf('\n\n');
    if (idx === -1) return [text, ''];
    return [text.slice(0, idx), text.slice(idx + 2)];
}

async function exportPrivateKey(key) {
    const exported = await crypto.subtle.exportKey("pkcs8", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

const nextConfig = {
    productionBrowserSourceMaps: true,
    transpilePackages: ['upack.js'],
    
    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }

        // クライアント側の本番ビルド時のみ暗号化フックを適用
        if (config.mode === 'production' && !isServer) {
            config.plugins.push({
                apply: (compiler) => {
                    compiler.hooks.emit.tapAsync('CustomEncryptPlugin', async (compilation, callback) => {
                        try {
                            console.log("[EMIT] Webpackビルド内での暗号化処理を開始します...");

                            const assetKeys = Object.keys(compilation.assets);
                            
                            // _buildManifest.js を探す
                            const manifestKey = assetKeys.find(key => key.includes('_buildManifest.js') || key.includes('buildManifest'));
                            if (!manifestKey) {
                                console.log("[EMIT] マニフェストが見つかりませんでした。スキップします。");
                                callback();
                                return;
                            }

                            const manifestSource = compilation.assets[manifestKey].source().toString('utf8');
                            
                            const allJsMatches = manifestSource.match(/"[^"]+\.js"/g) || [];
                            
                            const uniqueTargets = Array.from(new Set(allJsMatches.map(m => m.replace(/"/g, ''))));

                            const targets = uniqueTargets.filter(item => {
                                return item.endsWith('.js');
                            });

                            console.log(`[EMIT] 暗号化対象ファイル数: ${targets.length}`);

                            for (const item of targets) {
                                const targetKey = assetKeys.find(k => k === item || k.endsWith(item) || k.includes(item));
                                
                                if (targetKey && compilation.assets[targetKey]) {
                                    let fileContent = compilation.assets[targetKey].source().toString('utf8').trim();
                                    
                                    const [headPart, tailPart] = splitAtLastDoubleNewline(fileContent);
                                    
                                    // 鍵ペア生成と暗号化の前にWebCryptoが利用可能か保証
                                    const KeyPair = await upack.SEncoder.generateKeyPair();
                                    const PrivateKeyB64 = await exportPrivateKey(KeyPair.privateKey);

                                    const compressedBuffer = zlib.gzipSync(
                                        new TextEncoder().encode(headPart),
                                        { level: zlib.constants.Z_BEST_COMPRESSION }
                                    );

                                    const CHUNK_SIZE = 30000;
                                    const encodedChunksData = [];

                                    for (let i = 0; i < compressedBuffer.length; i += CHUNK_SIZE) {
                                        const chunk = compressedBuffer.subarray(i, i + CHUNK_SIZE);
                                        const FileEncoded = await upack.SEncoder.encodeSEncode(
                                            chunk,
                                            KeyPair.publicKey,
                                            10
                                        );
                                        if (FileEncoded) {
                                            encodedChunksData.push(FileEncoded);
                                        } else {
                                            console.error(`[EMIT ERROR] チャンクの暗号化結果が空です (index: ${i})`);
                                        }
                                    }

                                    console.log(`[DEBUG] 生成された暗号化チャンク数: ${encodedChunksData.length}`);
                                    const chunksJson = JSON.stringify(encodedChunksData);

                                    const FileJavascriptCode = `;${pako}\n${upack_js}\n
                                    ;(async function(){
                                        async function importPrivateKey(e){
                                            const r=Uint8Array.from(atob(e),e=>e.charCodeAt(0));
                                            return await crypto.subtle.importKey("pkcs8",r,{name:"ECDH",namedCurve:"P-256"},!0,["deriveKey","deriveBits"])
                                        };
                                        const privateKey = await importPrivateKey("${PrivateKeyB64}");
                                        const chunkStrings = ${chunksJson};
                                        console.log("[CLIENT] 復号開始, チャンク数:", chunkStrings.length);
                                        
                                        const decryptedChunks = [];
                                        let totalLength = 0;

                                        for (const encodedStr of chunkStrings) {
                                            const decodedResult = await upack.SEncoder.decodeSEncode(encodedStr, privateKey, 10, false);
                                            const decodedBytes = decodedResult instanceof ArrayBuffer ? new Uint8Array(decodedResult) : decodedResult;
                                            decryptedChunks.push(decodedBytes);
                                            totalLength += decodedBytes.length;
                                        }

                                        const combined = new Uint8Array(totalLength);
                                        let offset = 0;
                                        for (const chunk of decryptedChunks) {
                                            combined.set(chunk, offset);
                                            offset += chunk.length;
                                        }
                                        eval(pako.ungzip(combined, {toText: true}));
                                    })();`;
                                    
                                    const modifiedCode = FileJavascriptCode + "\n\n" + tailPart;

                                    compilation.assets[targetKey] = {
                                        source: () => modifiedCode,
                                        size: () => Buffer.byteLength(modifiedCode)
                                    };
                                    console.log(`[EMIT] 暗号化完了: ${targetKey}`);
                                }
                            }

                            console.log("[EMIT] すべてのファイルのインメモリ暗号化が完了しました。");
                            callback();
                        } catch (err) {
                            console.error("[EMIT ERROR]", err);
                            callback(err);
                        }
                    });
                }
            });
        }

        return config;
    },
};

module.exports = nextConfig;