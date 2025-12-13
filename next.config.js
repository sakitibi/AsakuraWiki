/** @type {import('next').NextConfig} */
const CSP = `
    default-src 'self';
    connect-src
        'self'
        https://asakura-wiki.vercel.app
        https://sakitibi.github.io
        https://counter.wikiwiki.jp
        https://gppjfculpjyjqzfuqfev.supabase.co
        https://ipwho.is;
    script-src 'self';
    style-src 'self';
`;

const nextConfig = {
    output: 'standalone',
    turbopack: {},

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                {
                    key: 'Content-Security-Policy',
                    value: CSP.replace(/\n/g, ' ').trim(),
                },
                ],
            },
        ];
    },

    webpack(config, { isServer }) {
        if (isServer) {
            config.externals = [...(config.externals || []), 'isows'];
        }
        return config;
    },
};

module.exports = nextConfig;
