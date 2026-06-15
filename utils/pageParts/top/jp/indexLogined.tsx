import versions from '@/utils/version';
import Link from 'next/link';
import styles from '@/css/index.module.css';
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

    // 日付の表示をスッキリさせるヘルパー
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-');
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <h1 className={styles.mainTitle}>
                    あさクラWiki<span className={styles.versionBadge}>{versions[2]}</span>
                </h1>

                <section id="view-counter" className={styles.counterWidget}>
                    <div className={styles.counterItem}>現在: <strong>{wiki13ninstudioCounter?.online ?? 0}</strong></div>
                    <div className={styles.counterItem}>今日: <strong>{wiki13ninstudioCounter?.today ?? 0}</strong></div>
                    <div className={styles.counterItem}>昨日: <strong>{wiki13ninstudioCounter?.yesterday ?? 0}</strong></div>
                    <div className={styles.counterItem}>合計: <strong>{wiki13ninstudioCounterTotal}</strong></div>
                </section>
            </header>

            <div className={styles.actionBlock}>
                <button onClick={goCreateWiki} className={styles.createWikiButton}>
                    <i className="fa-utility-fill fa-semibold fa-folder-plus" style={{ fontSize: 'inherit' }}></i>
                    <span>新しいWikiを作る</span>
                </button>
            </div>

            <div className={styles.contentGrid}>
                {/* みんなが評価しているWiki */}
                <section id="liked-wiki" className={styles.contentSection}>
                    <h2 className={styles.pLikedWiki__title}>みんなが評価しているWiki</h2>

                    {loadingLiked ? (
                        <p className={styles.loadingText}>Loading...</p>
                    ) : (
                        <ul className={styles.wikiCardList}>
                            {likedList.length === 0 ? (
                                <li className={styles.noData}>評価されたWikiがありません</li>
                            ) : (
                                likedList.map((wp) => (
                                    <li key={`liked-${wp.wikiSlug}`} className={styles.wikiCardItem}>
                                        <Link href={`/wiki/${wp.wikiSlug}`}>
                                            <button>
                                                <strong>{wp.name} Wiki*</strong>
                                            </button>
                                        </Link>
                                        <span className={styles.likeBadge}>平均いいね: {wp.like_count}人</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </section>

                {/* HOTなWiki */}
                <section id="hot-wiki" className={styles.contentSection}>
                    <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>
                        HOTなWiki
                    </h2>

                    <ul className={styles.wikiCardList}>
                        <li className={styles.wikiCardItem}>
                            <Link href="/special_wiki/13ninstudio">
                                <button>
                                    <strong>あさクラ{versions[0]} Wiki*</strong>
                                </button>
                            </Link>
                        </li>
                        <li className={styles.wikiCardItem}>
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
                    <p className={styles.loadingText}>Loading...</p>
                ) : pages.length === 0 ? (
                    <p className={styles.noData}>まだページがありません。</p>
                ) : (
                    <section id="wikis" className={`${styles.contentSection} ${styles.fullWidthSection}`}>
                        <div id="update-wiki">
                            <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>
                                最近更新されたWiki
                            </h2>

                            {loadingRecent ? (
                                <p className={styles.loadingText}>Loading...</p>
                            ) : (
                                <ul className={styles.recentWikiList}>
                                    {recentPages?.map((wp) => (
                                        <li key={`${wp.wikiSlug}/${wp.pageSlug}`} className={styles.recentWikiRow}>
                                            <div className={styles.recentWikiLeft}>
                                                <Link href={`/wiki/${wp.wikiSlug}`}>
                                                    <button>
                                                        <strong>{wp.name} Wiki*</strong>
                                                    </button>
                                                </Link>
                                            </div>
                                            <span className={styles.updateTime}>
                                                {formatDate(wp.updated_at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}