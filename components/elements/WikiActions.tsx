import React from 'react';
import Link from 'next/link';
import { NextRouter } from 'next/router';
import { User } from '@supabase/auth-helpers-react';
import { handleDelete, handleEdit, handleFreeze } from '@/utils/pageParts/wiki/wiki_handler';
import { usePageLikeHandlers } from '@/utils/pageParts/wiki/like/page';
import { useWikiLikeHandlers } from '@/utils/pageParts/wiki/like/wiki';
import { special_wiki_list } from '@/utils/wiki_list';

interface WikiActionsProps {
    router: NextRouter;
    wikiSlugStr: string;
    pageSlugStr: string;
    specialWikiFound?: string;
    user: User | null;
    isAsakuraMember: boolean;
    setIsButtonAction: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WikiActions: React.FC<WikiActionsProps> = ({
    router,
    wikiSlugStr,
    pageSlugStr,
    specialWikiFound,
    user,
    isAsakuraMember,
    setIsButtonAction,
}) => {
    const { handlePageLike, handlePageDisLike } = usePageLikeHandlers();
    const { handleWikiLike, handleWikiDisLike } = useWikiLikeHandlers();

    return (
        <>
            {wikiSlugStr === special_wiki_list[0] && pageSlugStr === 'FrontPage' && (
                <button onClick={() => router.replace(`/special_wiki/${special_wiki_list[0]}/${pageSlugStr}`)}>
                    <span>リダイレクトされない場合はこちら</span>
                </button>
            )}
            <button
                onClick={() => {
                    setIsButtonAction(true);
                    handleEdit(router, wikiSlugStr, pageSlugStr, setIsButtonAction);
                }}
                style={{ marginLeft: 8 }}
            >
                <span>このページを編集</span>
            </button>
            <button onClick={async () => await handleDelete(specialWikiFound, wikiSlugStr, pageSlugStr, router)}>
                <span>このページを削除</span>
            </button>
            <br />
            <Link href={`/dashboard/${wikiSlugStr}/new`}>
                <button style={{ marginLeft: 12 }}>
                    <span>新しいページを作成</span>
                </button>
            </Link>
            <button onClick={() => handleFreeze(wikiSlugStr, pageSlugStr, user)}>
                <span>このページを凍結 / 凍結解除</span>
            </button>
            <button onClick={handlePageLike} style={{ marginTop: 12 }}>
                <span>このページを高く評価</span>
            </button>
            <button onClick={handlePageDisLike} style={{ marginLeft: 8 }}>
                <span>このページを低く評価</span>
            </button>
            <br />
            <button onClick={handleWikiLike} style={{ marginLeft: 12 }}>
                <span>このWikiを高く評価</span>
            </button>
            <button onClick={handleWikiDisLike} style={{ marginLeft: 8 }}>
                <span>このWikiを低く評価</span>
            </button>
            <br />
            {!isAsakuraMember && (
                <div id="ad-container" style={{ textAlign: 'center' }}>
                    <iframe src="https://sakitibi.github.io/14ninadmanager.com/main-contents-buttom" width="700" height="350" />
                </div>
            )}
        </>
    );
};