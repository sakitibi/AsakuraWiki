const { createClient } = require('@supabase/supabase-js')

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
        const { data } = await supabase
            .from('wiki_pages')
            .select('wiki_slug, slug')

        if (!data) return []

        return data.map(row => {
            const path = row.slug
                ? `/wiki/${row.wiki_slug}/${row.slug}`
                : `/wiki/${row.wiki_slug}`

            return {
                loc: path,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.7,
            }
        })
    },
}
