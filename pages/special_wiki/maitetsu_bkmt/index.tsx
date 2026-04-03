import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BKMT_Front from '@/utils/pageParts/special_wiki/maitetsu_bkmt/Front';

export default function MaitetsuBKMTMain() {
    const router = useRouter()
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const cmdStr = typeof cmd === 'string' ? cmd : '';

    // クエリ→文字列化
        const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
        const pageSlugStr =
        typeof pageQuery === 'string'
            ? pageQuery
            : Array.isArray(pageSlug)
            ? pageSlug.join('/')
            : pageSlug ?? 'FrontPage';

    // state
    const [error]     = useState<string | null>(null)
    const [urlObj]   = useState<URL | null>(null)
    const designColor = "default";

    useEffect(() => {
        document.body.classList.add('wiki-font');
        document.body.classList.add('default');
        return () => {
            document.body.classList.remove('wiki-font');
            document.body.classList.remove('default');
        };
    }, [designColor]);

    useEffect(() => {
        if (cmdStr !== 'delete') return;
        if (!pageSlugStr || !wikiSlugStr) return;
    }, [cmdStr, pageSlugStr, wikiSlugStr]);

    // エラー or 読み込み中
    if (error)   return <div style={{ color: 'red' }}>{error}</div>

    const isEdit = urlObj?.searchParams.get('cmd') === 'edit'

    let commentSubmit:any = null;

    const CommentSubmitInterval = setInterval(() => {
        if(typeof document.getElementsByClassName("comment-submit") === 'undefined'){
            if(typeof document.getElementsByClassName("comment-submit") !== 'undefined'){
                commentSubmit = document.getElementsByClassName("comment-submit");
            }

            if ((isEdit) && (location.pathname === `/wiki/${wikiSlugStr}` || pageSlugStr === "FrontPage")) {
                for(let i = 0; i < commentSubmit.length; i++){
                    commentSubmit[i].setAttribute("disabled", "true");
                }
            }
        } else {
            const ClearInterval = setInterval(() => {
                clearInterval(CommentSubmitInterval);
                clearInterval(ClearInterval);
            }, 1000);
        }
    }, 1000);

    return <BKMT_Front/>
}