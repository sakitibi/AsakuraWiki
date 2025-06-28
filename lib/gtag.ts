export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// ページビューの送信
export const pageview = (url: string) => {
    if (!GA_ID) return;
    window.gtag('config', GA_ID, {
        page_path: url,
    });
};