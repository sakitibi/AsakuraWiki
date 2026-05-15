/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    output: 'standalone',
    transpilePackages: ['upack.js'],
    turbopack: {},
    typescript: {
        ignoreBuildErrors: true,
    },

    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }
        return config;
    },
};

module.exports = nextConfig;
