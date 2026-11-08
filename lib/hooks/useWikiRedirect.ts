import { useEffect } from 'react';
import { NextRouter } from 'next/router';
import { special_wiki_list } from '@/utils/wiki_list';

export function useWikiRedirect(
    wikiSlugStr: string,
    pageSlugStr: string,
    url: URL | null,
    router: NextRouter
) {
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;

        if (wikiSlugStr === special_wiki_list[0] && pageSlugStr === "FrontPage") {
            if (router.asPath !== "/special_wiki/maitetsu_bkmt") {
                router.replace("/special_wiki/maitetsu_bkmt");
            }
        } else if (
            wikiSlugStr === "authentication" &&
            pageSlugStr === "tokumei3971" &&
            url?.searchParams.get("client_id") === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRjYzdhNzgxLTJlMjUtOTNjMi01NGEzLTE0ZjNmZDIyMjZmYyIsInVzZXIiOiJ0b2t1bWVpMzk3MSJ9.Ekkwg_Oy54jFwW0-aUp-LHyYYzUh8b77EFwo-FJkHMk"
        ) {
            const clientId = url.searchParams.get("client_id");
            const targetPath = `/login/discord?client_id=${clientId}`;
            if (router.asPath !== targetPath) {
                router.replace(targetPath);
            }
        }
    }, [wikiSlugStr, pageSlugStr, url, router]);
}