/** @type {import('next').NextConfig} */
const path = require('path');
const runEncryption = require('./common_js/common.cjs');

const nextConfig = {
    productionBrowserSourceMaps: true,
    transpilePackages: ['upack.js'],
    turbopack: {},
    
    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }

        if (config.mode === 'production' && !isServer) {
            config.plugins.push({
                apply: (compiler) => {
                    compiler.hooks.done.tapPromise('EncryptChunksPlugin', async (stats) => {
                        const outputPath = compiler.outputPath;
                        const nextDir = path.resolve(outputPath, '../');
                        
                        console.log("Running post-build encryption in .next directory...");
                        await runEncryption(nextDir);
                    });
                }
            });
        }

        return config;
    },
};

module.exports = nextConfig;