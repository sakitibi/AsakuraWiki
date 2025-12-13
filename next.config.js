/** @type {import('next').NextConfig} */
const CSP = `
    default-src
        'self'
        https://asakura-wiki.vercel.app
        https://sakitibi.github.io;
    connect-src
        'self'
        https://asakura-wiki.vercel.app
        https://sakitibi.github.io
        https://www.googletagmanager.com
        https://counter.wikiwiki.jp
        https://gppjfculpjyjqzfuqfev.supabase.co
        https://ipwho.is;
    script-src
        'self'
        https://asakura-wiki.vercel.app
        https://sakitibi.github.io
        https://www.googletagmanager.com;
    style-src
        'self'
        https://sakitibi.github.io
        https://asakura-wiki.vercel.app;
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
