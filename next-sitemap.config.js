const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
const { createClient: createLibsqlClient } = require('@libsql/client')

// Supabaseクライアント (Store用)
const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Tursoクライアント (Wiki用)
const turso = createLibsqlClient({
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN,
})

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://asakura-wiki.vercel.app',
    generateRobotsTxt: true,
    sitemapSize: 7000,

    additionalPaths: async () => {
        // ==========================================
        // 1. 新エンジン (Turso) から Wiki ページを取得
        // ==========================================
        const wikiPaths = []
        try {
            // wiki_pages テーブルから全ページの情報を取得
            const result = await turso.execute(
                "SELECT wiki_slug, slug, updated_at FROM wiki_pages"
            )

            result.rows.forEach(row => {
                const wikiSlug = row.wiki_slug;
                const pageSlug = row.slug;
                const lastmod = row.updated_at;

                if (wikiSlug && pageSlug) {
                    // FrontPage はルート扱い (/wiki/slug)、それ以外はサブパス
                    const path = pageSlug === 'FrontPage' 
                        ? `/wiki/${wikiSlug}` 
                        : `/wiki/${wikiSlug}/${pageSlug}`
                    
                    wikiPaths.push({
                        loc: path,
                        lastmod: new Date(lastmod).toISOString(), // DBの更新日時を使用
                        changefreq: 'weekly',
                        priority: 0.8,
                    })
                }
            })
        } catch (e) {
            console.error('Sitemap Wiki (Turso) Error:', e)
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