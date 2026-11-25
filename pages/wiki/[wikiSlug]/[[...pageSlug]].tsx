import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { GetStaticPaths, GetStaticProps } from 'next';

import { WikiBanned, WikiDeleted } from '@/utils/pageParts/wiki/wiki_notfound';
import WikiEditPage from '@/utils/pageParts/wiki/wiki_edit';
import { WikiActions } from '@/components/elements/WikiActions';
import { WikiNavigation } from '@/components/elements/WikiNavigation';

import { useWikiPage } from '@/lib/hooks/useWikiPage';
import { fetchWikiStaticData } from '@/utils/wiki/wikiServerHelpers';
import { Page } from '@/utils/wiki/wikiFetch';
import { editMode, designColor } from '@/utils/wiki/wiki_settings';

interface WikiPageProps {
    initialPage: Page | null;
    initialDesignColor: designColor | null;
    initialMenubar: Page | null;
    initialSidebar: Page | null;
    initialEditMode: editMode;
    errorMsg: string | null;
}

export default function WikiPage(props: WikiPageProps) {
    const {
        router,
        user,
        title,
        setTitle,
        content,
        setContent,
        beforeContent,
        editMode,
        designColor,
        parsedPreview,
        menubar,
        parsedMenubar,
        sidebar,
        parsedSidebar,
        wikiSlugStr,
        pageSlugStr,
        isEdit,
        ban_wiki_list_found,
        deleted_wiki_list_found,
        special_wiki_list_found,
        asakura_member_list_found,
    } = useWikiPage(props);

    const isPageNotFound = props.errorMsg === 'ページが見つかりませんでした';
    const shouldShowError = props.errorMsg && !props.initialPage && !(isEdit && isPageNotFound);

    if (shouldShowError) {
        return (
            <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '1.5rem', margin: '2rem auto', maxWidth: '600px', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
                エラーが発生しました: {props.errorMsg}
            </div>
        );
    }

    const displayTitle = title || pageSlugStr;

    return (
        <>
            {ban_wiki_list_found ? (
                <WikiBanned />
            ) : deleted_wiki_list_found ? (
                <WikiDeleted />
            ) : (
                <>
                    <Head>
                        <title>
                            {displayTitle}
                            {isEdit ? ' の編集' : null}
                        </title>
                        <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/wikis.module.css" />
                    </Head>
                    {isEdit ? (
                        <WikiEditPage
                            title={displayTitle}
                            setTitle={setTitle}
                            content={content}
                            beforeContent={beforeContent}
                            setContent={setContent}
                            parsedPreview={parsedPreview}
                            loading={false}
                            wikiSlugStr={wikiSlugStr}
                            pageSlugStr={pageSlugStr}
                            setLoading={() => {}}
                            editMode={editMode}
                            user={user}
                            router={router}
                        />
                    ) : (
                        <>
                            <div id="contents-wrapper">
                                <div className="container" style={{ display: 'flex', width: '100%', maxWidth: '1280px', margin: '0 auto', gap: '20px', alignItems: 'flex-start' }}>
                                    <WikiNavigation
                                        type="menubar"
                                        menubar={menubar}
                                        parsedMenubar={parsedMenubar}
                                    />

                                    <article style={{ flex: 1, padding: '2rem', minWidth: 0 }} className="columnCenter clearfix">
                                        {parsedPreview?.map((node, i) => (
                                            <React.Fragment key={i}>{node}</React.Fragment>
                                        ))}
                                        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                                            <WikiActions
                                                router={router}
                                                wikiSlugStr={wikiSlugStr}
                                                pageSlugStr={pageSlugStr}
                                                specialWikiFound={!!special_wiki_list_found}
                                                user={user}
                                                isAsakuraMember={!!asakura_member_list_found}
                                            />
                                        </div>
                                    </article>

                                    <WikiNavigation
                                        type="sidebar"
                                        sidebar={sidebar}
                                        parsedSidebar={parsedSidebar}
                                    />

                                    {!asakura_member_list_found && (
                                        <>
                                            <Script src="https://sakitibi.github.io/14ninadmanager.com/js/14nin_vignette_v2_main.js" />
                                            <Script src="https://sakitibi.github.io/14ninadmanager.com/js/14nin_vignette_v2_util.js" />
                                        </>
                                    )}
                                </div>
                            </div>
                            <footer className={`footer_${designColor} clearfix`} style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                                <div>
                                    レンタルWiki by <a href="/" title="無料レンタルWikiサービス">あさクラWiki</a>
                                    &nbsp;/&nbsp;
                                    <a href="/about/ad" title="広告について">広告について</a>
                                </div>
                            </footer>
                        </>
                    )}
                </>
            )}
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const params = context.params?.pageSlug;
    const wikiSlug = context.params?.wikiSlug;

    const wikiSlugStr: string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr: string = Array.isArray(params) ? params.join('/') : params ?? 'FrontPage';

    if (/\.(map|js|css|ico|png|jpg|jpeg|gif|json|svg|woff2?|ttf|eot)$/i.test(pageSlugStr)) {
        return {
            notFound: true,
        };
    }

    if (!wikiSlugStr || !pageSlugStr) {
        return {
            props: {
                initialPage: null,
                initialDesignColor: null,
                initialMenubar: null,
                initialSidebar: null,
                initialEditMode: 'public',
                errorMsg: 'パラメータが不正です',
            },
        };
    }

    try {
        const data = await fetchWikiStaticData(wikiSlugStr, pageSlugStr);
        return {
            props: data,
            revalidate: data.errorMsg ? 10 : 60,
        };
    } catch (err: any) {
        return {
            props: {
                initialPage: null,
                initialDesignColor: null,
                initialMenubar: null,
                initialSidebar: null,
                initialEditMode: 'public',
                errorMsg: err?.message || 'ページ読み込み中にエラーが発生しました',
            },
            revalidate: 10,
        };
    }
};