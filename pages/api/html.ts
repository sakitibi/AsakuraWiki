import { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from 'cheerio';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const { page } = req.query;
    const pageUrl = page as string;

    if (!pageUrl) {
        return res.status(400).send('<h1>Error: Missing page parameter</h1>');
    }

    // これを入れないとエラーになる
    if (pageUrl.startsWith(process.env.NEXT_PUBLIC_API_BASE_URL!)) {
        return res.status(302).redirect(pageUrl);
    }

    try {
        const response = await fetch(pageUrl);
        if (!response.ok) throw new Error(`Failed to fetch page: ${response.status}`);
        
        const htmlContent = await response.text();
        const $ = cheerio.load(htmlContent);

        $('img[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !src.startsWith('data:') && !src.startsWith('http')) {
                try {
                    // 相対パスを絶対パスに変換
                    const absoluteSrc = new URL(src, pageUrl).href;
                    $(el).attr('src', absoluteSrc);
                } catch (e) {
                    console.error(`Failed to resolve img src: ${src}`, e);
                }
            }
        });

        const processCss = async (cssText: string, baseUrl: string) => {
            const urlRegex = /url\((?!['"]?data:)(['"]?)([^'")]*)\1\)/g;
            const matches = Array.from(cssText.matchAll(urlRegex));

            for (const match of matches) {
                const originalMatch = match[0];
                const rawUrl = match[2];

                try {
                    // 相対パスを絶対URLに変換
                    const absoluteUrl = new URL(rawUrl, baseUrl).href;
                    
                    // 画像/フォントファイルをfetch
                    const res = await fetch(absoluteUrl);
                    if (!res.ok) continue;

                    const buffer = await res.arrayBuffer();
                    const contentType = res.headers.get('content-type') || 'application/octet-stream';
                    
                    // Base64に変換
                    const base64 = Buffer.from(buffer).toString('base64');
                    const dataUri = `data:${contentType};base64,${base64}`;

                    // CSS内のURLを置換
                    cssText = cssText.replace(originalMatch, `url("${dataUri}")`);
                } catch (e) {
                    console.error(`Failed to inline asset: ${rawUrl}`, e);
                }
            }
            return cssText;
        };

        // 1. すべての <link rel="stylesheet"> を抽出
        const linkTags = $('link[rel="stylesheet"][href]');
        const cssTasks = linkTags.map(async (_, el) => {
            const href = $(el).attr('href');
            if (!href) return '';
            
            const absoluteHref = new URL(href, pageUrl).href;
            const res = await fetch(absoluteHref);
            if (!res.ok) return '';
            
            const rawCss = await res.text();
            // 取得したCSS内の相対パスをData URI化
            return await processCss(rawCss, absoluteHref);
        }).get();

        const cssContents = await Promise.all(cssTasks);
        const combinedCss = cssContents.join('\n');

        // 2. 既存のlinkを削除し、加工済みCSSを注入
        linkTags.remove();
        $('head').append(`<style>${combinedCss}</style>`);

        res.status(200).send($.html());
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error instanceof Error ? error.message : 'Unknown error'}</p>`);
    }
}