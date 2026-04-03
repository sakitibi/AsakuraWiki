const { createClient } = require('@supabase/supabase-js')
const { list } = require('@vercel/blob')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://asakura-wiki.vercel.app',
    generateRobotsTxt: true,
    sitemapSize: 7000,

    additionalPaths: async () => {
        // ==========================================
        // 1. 新エンジン (Vercel Blob) から Wiki ページを取得
        // ==========================================
        const wikiPaths = []
        try {
            // Blob内の 'asakura-wiki-blob/' プレフィックスが付いた全ファイルをスキャン
            const { blobs } = await list({
                prefix: 'asakura-wiki-blob/',
                token: process.env.BLOB_READ_WRITE_TOKEN
            })

            blobs.forEach(blob => {
                // パス例: asakura-wiki-blob/wiki-slug/page-slug.json
                const parts = blob.pathname.replace('asakura-wiki-blob/', '').split('/')
                const wikiSlug = parts[0]
                const pageSlugWithExt = parts.slice(1).join('/')
                const pageSlug = pageSlugWithExt.replace('.json', '')

                if (wikiSlug) {
                    const path = pageSlug === 'FrontPage' 
                        ? `/wiki/${wikiSlug}` 
                        : `/wiki/${wikiSlug}/${pageSlug}`
                    
                    wikiPaths.push({
                        loc: path,
                        lastmod: blob.uploadedAt.toISOString(), // Blobの更新日時を使用
                        changefreq: 'weekly',
                        priority: 0.8,
                    })
                }
            })
        } catch (e) {
            console.error('Sitemap Wiki Error:', e)
        }

        // ==========================================
        // 2. 既存の Store (Supabase) データを取得
        // ==========================================
        const { data: apps_data } = await supabase.from("store.apps").select("appid")
        const { data: devs_data } = await supabase.from("store.developers").select("developer_id")

        const storePaths = (apps_data || []).map(app => ({
            loc: `/store/details/${app.appid}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.6,
        })).concat((devs_data || []).map(dev => ({
            loc: `/store/developers/${dev.developer_id}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.5,
        })))

        return [...wikiPaths, ...storePaths]
    },
}