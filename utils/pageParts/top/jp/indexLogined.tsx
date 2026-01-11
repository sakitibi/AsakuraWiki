import versions from '@/utils/version';
import Link from 'next/link';
import styles from '@/css/index.min.module.css';
import type { WikiCounter, WikiPage, LikedWiki } from '@/utils/pageParts/top/indexInterfaces';

export interface LoginedUIProps {
    wiki13ninstudioCounter: WikiCounter | null;
    wiki13ninstudioCounterTotal: number;
    loadingLiked: boolean;
    likedWikis: LikedWiki[];
    readonly H2Styles: React.CSSProperties;
    loading: boolean;
    pages: WikiPage[];
    loadingRecent?: boolean;
    recentPages?: WikiPage[];
    readonly goCreateWiki: () => void;
}

export default function LoginedUI({
    wiki13ninstudioCounter,
    wiki13ninstudioCounterTotal,
    loadingLiked,
    likedWikis,
    H2Styles,
    loading,
    pages,
    loadingRecent,
    recentPages,
    goCreateWiki
}: LoginedUIProps) {

    const likedList = likedWikis.filter((wp) => wp.like_count > 0);

    return (
        <>
            <h1>あさクラWiki{versions[0]}</h1>

            {/* 閲覧数 */}
            <section id="view-counter" className="section">
                <p>今日の閲覧数: {wiki13ninstudioCounter?.today ?? 0}</p>
                <p>合計の閲覧数: {wiki13ninstudioCounterTotal}</p>
                <p>昨日の閲覧数: {wiki13ninstudioCounter?.yesterday ?? 0}</p>
                <p>現在の閲覧数: {wiki13ninstudioCounter?.online ?? 0}</p>
            </section>

            {/* みんなが評価しているWiki */}
            <section id="liked-wiki" className="section">
                <h2 className={styles.pLikedWiki__title}>みんなが評価しているWiki</h2>

                {loadingLiked ? (
                    <p>Loading...</p>
                ) : (
                    <ul>
                        {likedList.length === 0 ? (
                            <li>評価されたWikiがありません</li>
                        ) : (
                            likedList.map((wp) => (
                                <li key={`liked-${wp.wikiSlug}`}>
                                    <Link href={`/wiki/${wp.wikiSlug}`}>
                                        <button>
                                            <strong>{wp.name} Wiki*</strong>
                                        </button>
                                    </Link>
                                    <small>平均いいね数: {wp.like_count}人</small>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </section>

            {/* HOTなWiki */}
            <section id="hot-wiki" className="section">
                <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>
                    HOTなWiki
                </h2>

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
            </section>

            {/* 最近更新されたWiki */}
            {loading ? (
                <p>Loading...</p>
            ) : pages.length === 0 ? (
                <p>まだページがありません。</p>
            ) : (
                <section id="wikis" className="section">
                    <div id="update-wiki">
                        <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>
                            最近更新されたWiki
                        </h2>

                        {loadingRecent ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {recentPages?.map((wp) => (
                                    <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                                        <Link href={`/wiki/${wp.wikiSlug}`}>
                                            <button>
                                                <strong>{wp.name} Wiki*</strong>
                                            </button>
                                        </Link>
                                        <small>（{new Date(wp.updated_at).toLocaleString()}）</small>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            )}

            {/* 新しいWikiを作る */}
            <br />
            <button onClick={goCreateWiki}>
                <i
                    className="fa-utility-fill fa-semibold fa-folder-plus"
                    style={{ fontSize: 'inherit' }}
                ></i>
                <span>新しいWikiを作る</span>
            </button>
        </>
    );
}
