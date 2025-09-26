import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/HeaderRu';
import MenuRu from '@/utils/pageParts/top/MenuRu';
import RightMenuRu from '@/utils/pageParts/top/RightMenuRu';
import LeftMenuRu from '@/utils/pageParts/top/LeftMenuRu';
import FooterRu from '@/utils/pageParts/top/FooterRu';
import versions from '@/utils/version';
import type { WikiPage, LikedWiki, WikiCounter } from '@/utils/pageParts/top/indexInterfaces';
import { fetchRecentPages, fetchLikedWikis, fetched13ninstudioCounter } from '@/utils/pageParts/top/indexfetchsRu';

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [loadingLiked, setLoadingLiked] = useState<boolean>(true);
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);

    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate',
        textAlign: 'center'
    }

    useEffect(() => {
        fetchRecentPages(setPages, setLoading);
        fetchLikedWikis(setLoadingLiked, setLikedWikis);
        fetched13ninstudioCounter(setWiki13ninstudioCounter);
    }, []);

    useEffect(() => {
        console.log("index: ", wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter]);

    const wiki13ninstudioCounterTotal = wiki13ninstudioCounter?.total! + 1391;

    const goCreateWiki = () => {
        location.href = '/dashboard/create-wiki'
    }

    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };

    return (
        <>
        <Head>
            <title>БЕСПЛАТНАЯ АРЕНДА WIKI-СЕРВИСА АсакураWIKI</title>
            <style jsx global>
                {`
                    /* css start */
                    *, :after, :before {
                        box-sizing: border-box;
                    }
                    /* css end */
                `}
            </style>
        </Head>
        <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
        <div className={styles.contentsWrapper}>
            <HeaderRu handleClick={handleClick}/>
            <div className={styles.contents}>
                <LeftMenuRu URL="/"/>
                <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                    <h1>АсакураWiki{versions[0]}</h1>
                        <div id="view-counter">
                            <p>Сегодняшние взгляды: {wiki13ninstudioCounter?.today ?? 0}</p>
                            <p>Всего просмотров: {wiki13ninstudioCounterTotal ? wiki13ninstudioCounterTotal : 0}</p>
                            <p>Вчерашние взгляды: {wiki13ninstudioCounter?.yesterday ?? 0}</p>
                            <p>Текущие взгляды: {wiki13ninstudioCounter?.online ?? 0}</p>
                        </div>
                        <div id="liked-wiki">
                            <h2 className={styles.pLikedWiki__title}>оценено всеми Wiki</h2>
                                {loadingLiked ? <p>Loading...</p> : (
                                    <ul>
                                    {likedWikis.filter((wp) => wp.like_count > 0).length === 0
                                    ? <li>Нет рейтинга Wiki</li>
                                    : likedWikis
                                        .filter((wp) => wp.like_count > 0)
                                        .map((wp) => (
                                            <li key={`liked-${wp.wikiSlug}`}>
                                            <Link href={`/wiki/${wp.wikiSlug}`}>
                                                <button><strong>{wp.name} Wiki*</strong></button>
                                            </Link>
                                            <small>Среднее количество лайков: {wp.like_count}</small>
                                            </li>
                                        ))
                                    }
                                    </ul>
                                )}
                            </div>
                        <div id="hot-wiki">
                            <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>ГОРЯЧАЯ Wiki</h2>
                            <ul>
                                <li>
                                    <Link href="/special_wiki/13ninstudio">
                                        <button>
                                            <strong>あさクラ{versions[0]} Wiki*</strong>
                                        </button>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/special_wiki/maitetsu_bkmt">
                                        <button>
                                            <strong>マイ鉄ネット撲滅委員会 Wiki*</strong>
                                        </button>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    {loading ? (
                    <p>Loading...</p>
                    ) : pages.length === 0 ? (
                    <p>Страниц пока нет.</p>
                    ) : (
                        <div id="wikis">
                            <div id="update-wiki">
                                <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>Недавно <br/>обновленнаяWiki</h2>
                                <ul>
                                    {pages.map((wp) => (
                                    <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                                        <Link
                                        href={`/wiki/${wp.wikiSlug}`}
                                        >
                                        <button>
                                            <span>
                                                <strong>{wp.name} Wiki*</strong>
                                            </span>
                                        </button>
                                        </Link>{' '}
                                        <small>
                                        （{new Date(wp.updated_at).toLocaleString()}）
                                        </small>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <br />
                    <button onClick={goCreateWiki}>
                    <span>＋ Создать новую Вики (японский)</span>
                    </button>
                </main>
                <RightMenuRu/>
            </div>
            <FooterRu/>
        </div>
        </>
    )
}