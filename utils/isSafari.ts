export function isSafari(): boolean | undefined {
    if (typeof window === 'undefined' || !navigator) return;
    const ua = navigator.userAgent.toLowerCase();

    const isSafariBrowser =
        ua.includes('safari') &&
        !ua.includes('chrome') &&
        !ua.includes('crios') &&
        !ua.includes('fxios');

    const isIosWebView = (ua.includes('iphone') || ua.includes('ipad')) && ua.includes('applewebkit') && !ua.includes('safari');

    return isSafariBrowser || isIosWebView;
}