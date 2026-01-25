const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const errKaihi = [
    "/",
    "/about"
]

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://asakura-wiki.vercel.app',
    generateRobotsTxt: true,
    sitemapSize: 7000,

    additionalPaths: async () => {
        const { data: wiki_pages_data } = await supabase
            .from('wiki_pages')
            .select('wiki_slug, slug')

        if (!wiki_pages_data) return []

        const { data: apps_data } = await supabase
            .from("store.apps")
            .select("appid")

        if (!apps_data) return []

        const { data: devs_data } = await supabase
            .from("store.developers")
            .select("developer_id")

        if (!devs_data) return []
        return wiki_pages_data.map(row => {
            const path = row.slug
                ? `/wiki/${row.wiki_slug}/${row.slug}`
                : `/wiki/${row.wiki_slug}`

            return {
                loc: path,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.7,
            }
        }).concat(
            apps_data.map(app => {
                const path = `/store/details/${app.appid}`;
                return {
                    loc: path,
                    lastmod: new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.7,
                }
            })
        ).concat(
            devs_data.map(dev => {
                const path = `/store/developers/${dev.developer_id}`
                return {
                    loc: path,
                    lastmod: new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.7,
                }
            })
        ).concat(
            errKaihi.map((data) => {
                const path = "/gsc/idx" + data
                return {
                    loc: path,
                    lastmod: new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.7,
                }
            })
        )
    },
}
