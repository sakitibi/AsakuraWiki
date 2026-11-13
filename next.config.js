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
                            
                            const manifestKey = assetKeys.find(key => key.includes('_buildManifest.js'));
                            if (!manifestKey) {
                                console.log("[EMIT] _buildManifestが見つかりませんでした。スキップします。");
                                callback();
                                return;
                            }

                            const manifestSource = compilation.assets[manifestKey].source().toString('utf8');
                            const sliced = JSON.parse(
                                manifestSource.slice(
                                    24,
                                    manifestSource.indexOf("self.__TURBOPACK_PAGE_BOOTSTRAP") - 1
                                )
                            );
                            
                            const rootPathKey = sliced["/"][0]; // 例: static/immutable/chunks/...
                            const rootAsset = compilation.assets[rootPathKey];
                            if (!rootAsset) {
                                console.log("[EMIT] Rootベースファイルが見つかりませんでした。");
                                callback();
                                return;
                            }

                            const rootSource = rootAsset.source().toString('utf8');
                            const rootBaseParsed = JSON.parse(
                                rootSource.slice(35, rootSource.length - 1)
                            ).filter(value => value.endsWith(".js"));

                            const targets = rootBaseParsed.slice(0, Object.keys(rootBaseParsed).length - 1);
                            console.log(`[EMIT] 暗号化対象ファイル数: ${targets.length}`);

                            for (const item of targets) {
                                const targetKey = item.startsWith('/') ? item.slice(1) : item;
                                
                                if (compilation.assets[targetKey]) {
                                    let fileContent = compilation.assets[targetKey].source().toString('utf8').trim();
                                    
                                    const [headPart, tailPart] = splitAtLastDoubleNewline(fileContent);
                                    const KeyPair = await upack.SEncoder.generateKeyPair();
                                    const PrivateKeyB64 = await exportPrivateKey(KeyPair.privateKey);

                                    const FileEncoded = await upack.SEncoder.encodeSEncode(
                                        new TextEncoder().encode(headPart),
                                        KeyPair.publicKey,
                                        10
                                    );
                                    const compressedBuffer = zlib.gzipSync(FileEncoded, { level: zlib.constants.Z_BEST_COMPRESSION });

                                    const decimalArray = Array.from(compressedBuffer);
                                    const commaSeparatedDecimal = decimalArray.join(',');

                                    const FileJavascriptCode = `;${pako}\n${upack_js}\n
                                    ;(async function(){async function importPrivateKey(e){const r=Uint8Array.from(atob(e),e=>e.charCodeAt(0));return await crypto.subtle.importKey("pkcs8",r,{name:"ECDH",namedCurve:"P-256"},!0,["deriveKey","deriveBits"])};
                                    eval(await upack.SEncoder.decodeSEncode(pako.ungzip(new Uint8Array([${commaSeparatedDecimal}]),{toText:true}), await importPrivateKey("${PrivateKeyB64}"), 10, true))})();`;
                                    
                                    const modifiedCode = FileJavascriptCode + "\n\n" + tailPart;

                                    // Webpackのメモリ上にあるアセットを置換
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