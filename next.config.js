/** @type {import('next').NextConfig} */
const nextConfig = {
    mode: "production",
    productionBrowserSourceMaps: true,
    output: 'standalone',
    devtool: "source-map",
    turbopack: {},

    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }
        return config;
    },
};

module.exports = nextConfig;
