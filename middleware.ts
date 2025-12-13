import { NextResponse } from 'next/server'

export function middleware() {
    const nonce = Buffer.from(
        crypto.getRandomValues(new Uint8Array(16))
    ).toString('base64');
    const csp = `
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
        img-src
            'self'
            https://sakitibi.github.io
            https://asakura-wiki.vercel.app
            https://yt3.googleusercontent.com;
    `.replace(/\n/g, ' ').trim();
    const res = NextResponse.next();
    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('x-nonce', nonce);
    return res
}
