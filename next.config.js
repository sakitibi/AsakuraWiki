/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    transpilePackages: ['upack.js'],
    turbopack: {},
    
    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }
        return config;
    },
};

module.exports = nextConfig;
