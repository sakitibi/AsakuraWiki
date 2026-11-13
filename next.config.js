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
        }

        return config;
    },
};

module.exports = nextConfig;