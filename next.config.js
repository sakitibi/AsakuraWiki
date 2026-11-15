/** @type {import('next').NextConfig} */
const upack = require('upack.js/dist/cjs/index.cjs');
const { upack_js, pako } = require('./common_js/upack_template.cjs');
const zlib = require('zlib');

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
                                        const base64Chunk = Buffer.from(chunk).toString('base64');
                                        const FileEncoded = await upack.SEncoder.encodeSEncode(
                                            base64Chunk,
                                            KeyPair.publicKey,
                                            10
                                        );
                                        encodedChunksData.push(FileEncoded);
                                    }

                                    const chunksJson = JSON.stringify(encodedChunksData);

                                    const FileJavascriptCode = `;${pako}\n${upack_js}\n
                                    ;(async function(){
                                        async function importPrivateKey(e){
                                            const r=Uint8Array.from(atob(e),e=>e.charCodeAt(0));
                                            return await crypto.subtle.importKey("pkcs8",r,{name:"ECDH",namedCurve:"P-256"},!0,["deriveKey","deriveBits"])
                                        };
                                        const privateKey = await importPrivateKey("${PrivateKeyB64}");
                                        const chunkStrings = ${chunksJson};
                                        const decryptedByteArrays = [];
                                        let totalLength = 0;

                                        for (const encodedStr of chunkStrings) {
                                            const decodedBase64 = await upack.SEncoder.decodeSEncode(encodedStr, privateKey, 10, true);
                                            const binaryString = atob(decodedBase64);
                                            const len = binaryString.length;
                                            const bytes = new Uint8Array(len);
                                            for (let i = 0; i < len; i++) {
                                                bytes[i] = binaryString.charCodeAt(i);
                                            }
                                            decryptedByteArrays.push(bytes);
                                            totalLength += len;
                                        }

                                        const combined = new Uint8Array(totalLength);
                                        let offset = 0;
                                        for (const bytes of decryptedByteArrays) {
                                            combined.set(bytes, offset);
                                            offset += bytes.length;
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