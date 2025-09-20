/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    assetPrefix: "./", // Electron の相対パス読み込み用
    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }
        return config;
    },
};

module.exports = nextConfig;