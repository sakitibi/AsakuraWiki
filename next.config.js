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
/*
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
                            
                            // JSON部分を安全に抽出（固定の文字数スライスを使わない）
                            const jsonMatch = manifestSource.match(/\{[\s\S]*\}/);
                            if (!jsonMatch) {
                                console.log("[EMIT] マニフェストからJSONを抽出できませんでした。");
                                callback();
                                return;
                            }

                            const sliced = JSON.parse(jsonMatch[0]);
                            const rootPathKey = sliced["/"] && sliced["/"][0]; 
                            
                            if (!rootPathKey) {
                                console.log("[EMIT] Rootベースキーが見つかりませんでした。");
                                callback();
                                return;
                            }

                            // アセットキーの揺れ（先頭の有無など）に対応
                            const targetRootKey = assetKeys.find(k => k.includes(rootPathKey) || rootPathKey.includes(k));
                            if (!targetRootKey || !compilation.assets[targetRootKey]) {
                                console.log("[EMIT] Rootベースファイルが見つかりませんでした。:", rootPathKey);
                                callback();
                                return;
                            }

                            const rootSource = compilation.assets[targetRootKey].source().toString('utf8');
                            
                            // 正規表現でJSファイルのパスを安全に全て抽出する
                            const jsFileMatches = rootSource.match(/"[^"]+\.js"/g) || [];
                            const rootBaseParsed = jsFileMatches.map(m => m.replace(/"/g, ''));

                            const targets = rootBaseParsed.slice(0, Math.max(0, rootBaseParsed.length - 1));
                            console.log(`[EMIT] 暗号化対象ファイル数: ${targets.length}`);

                            for (const item of targets) {
                                const targetKey = assetKeys.find(k => k.endsWith(item) || k.includes(item));
                                
                                if (targetKey && compilation.assets[targetKey]) {
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
        }*/

        return config;
    },
};

module.exports = nextConfig;