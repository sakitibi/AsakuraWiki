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

    if (pageUrl.startsWith(process.env.NEXT_PUBLIC_API_BASE_URL!)) {
        return res.status(302).redirect(pageUrl);
    }

    try {
        const response = await fetch(pageUrl);
        if (!response.ok) throw new Error(`Failed to fetch page: ${response.status}`);
        
        const htmlContent = await response.text();
        const $ = cheerio.load(htmlContent);

        // 1. すべての <link rel="stylesheet"> を抽出
        const linkTags = $('link[rel="stylesheet"][href]');
        const cssPromises: Promise<string>[] = [];

        linkTags.each((_: any, el) => {
            let href = $(el).attr('href');
            if (href) {
                // 相対パスを絶対パスに変換
                const absoluteHref = new URL(href, pageUrl).href;
                
                // CSSを取得するプロミスを配列に入れる
                cssPromises.push(
                    fetch(absoluteHref)
                        .then(res => res.ok ? res.text() : '')
                        .catch(() => '') // エラー時は空文字を返す
                );
            }
        });

        // 2. すべてのCSS取得が終わるまで待機
        const cssContents = await Promise.all(cssPromises);
        const combinedCss = cssContents.join('\n');

        // 3. 既存のlinkタグを削除し、新しいstyleタグを注入
        linkTags.remove();
        $('head').append(`<style>${combinedCss}</style>`);

        res.status(200).send($.html());
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error instanceof Error ? error.message : 'Unknown error'}</p>`);
    }
}