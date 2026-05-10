import { NextResponse, NextRequest } from 'next/server'

export function proxy(_: NextRequest) {
    const csp = `
        default-src
        'self'
        https://sakitibi.github.io;
        connect-src
        'self'
        https://sakitibi.github.io
        https://www.googletagmanager.com
        https://counter.wikiwiki.jp
        https://www.google.com
        https://www.google-analytics.com
        https://gppjfculpjyjqzfuqfev.supabase.co
        wss://gppjfculpjyjqzfuqfev.supabase.co
        https://ipwho.is;
        script-src * 'unsafe-inline' 'unsafe-eval' blob:;
        worker-src
        'self'
        https://sakitibi.github.io
        blob:;
        style-src * 'unsafe-inline';
        font-src * data:;
        img-src *;
        media-src *;
        frame-src *;
    `.replace(/\n/g, ' ').trim();
    const res = NextResponse.next();
    res.headers.set('Content-Security-Policy', csp);

    return res
}
