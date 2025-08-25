/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    distDir: "standalone/.next",
    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }
        return config;
    },
};

module.exports = nextConfig;