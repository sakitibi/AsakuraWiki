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
        https://wikiwiki.jp
        https://counter.wikiwiki.jp
        https://www.google.com
        https://www.google-analytics.com
        https://gppjfculpjyjqzfuqfev.supabase.co
        https://cdn.jsdelivr.net
        https://cdn.wikiwiki.jp
        https://y.one.impact-ad.jp
        https://grid-bidder.criteo.com
        https://fastlane.rubiconproject.com
        https://htlb.casalemedia.com
        https://prebid.a-mo.net
        https://prebid-asia.creativecdn.com
        https://s-rtb-pb.send.microad.jp/prebid
        https://ad.as.amanad.adtdp.com
        https://shb.richaudience.com
        https://mp.4dex.io
        https://d.socdm.com
        https://api.w.inmobi.com
        https://sp.gmossp-sp.jp
        https://sync.inmobi.com
        https://securepubads.g.doubleclick.net
        https://match.prod.bidr.io
        https://lrcm.amgdgt.com
        https://ib.adnxs.com
        https://hbopenbid.pubmatic.com
        https://pagead2.googlesyndication.com
        https://shopping-guide.gliastudios.com
        wss://gppjfculpjyjqzfuqfev.supabase.co
        https://ipwho.is;
        script-src * 'unsafe-inline' 'unsafe-eval' blob:;
        worker-src
        'self'
        https://sakitibi.github.io
        blob:;
        style-src * 'unsafe-inline';
        font-src * data:;
        img-src * data:;
        media-src *;
        frame-src *;
    `.replace(/\n/g, ' ').trim();
    const res = NextResponse.next();
    res.headers.set('Content-Security-Policy', csp);

    return res
}
