import versions from '@/utils/version';
import Link from 'next/link';
import styles from 'css/index.min.module.css';
import type { WikiCounter, WikiPage, LikedWiki } from '@/utils/pageParts/top/indexInterfaces';

interface LoginedUIProps{
    wiki13ninstudioCounter:WikiCounter | null,
    wiki13ninstudioCounterTotal:number,
    loadingLiked:boolean,
    likedWikis:LikedWiki[],
    H2Styles:React.CSSProperties,
    loading:boolean,
    pages:WikiPage[],
    loadingRecent:boolean,
    recentPages:WikiPage[],
    goCreateWiki:() => void
}

export default function LoginedUI(
{
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
}: LoginedUIProps
){
    return(
        <>
            <h1>あさクラWiki{versions[0]}</h1>
            <div id="view-counter">
                <p>今日の閲覧数: {wiki13ninstudioCounter?.today ?? 0}</p>
                <p>合計の閲覧数: {wiki13ninstudioCounterTotal ? wiki13ninstudioCounterTotal : 0}</p>
                <p>昨日の閲覧数: {wiki13ninstudioCounter?.yesterday ?? 0}</p>
                <p>現在の閲覧数: {wiki13ninstudioCounter?.online ?? 0}</p>
            </div>
            <div id="liked-wiki">
                <h2 className={styles.pLikedWiki__title}>みんなが評価しているWiki</h2>
                {loadingLiked ? <p>Loading...</p> : (
                <ul>
                {likedWikis.filter((wp) => wp.like_count > 0).length === 0
                ? <li>評価されたWikiがありません</li>
                : likedWikis
                    .filter((wp) => wp.like_count > 0)
                    .map((wp) => (
                        <li key={`liked-${wp.wikiSlug}`}>
                            <Link href={`/wiki/${wp.wikiSlug}`}>
                                <button><strong>{wp.name} Wiki*</strong></button>
                            </Link>
                            <small>平均いいね数: {wp.like_count}人</small>
                        </li>
                    ))
                }
                </ul>
                )}
            </div>
            <div id="hot-wiki">
                <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>HOTなWiki</h2>
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
            <p>まだページがありません。</p>
            ) : (
            <div id="wikis">
                <div id="update-wiki">
                <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>最近更新されたWiki</h2>
                {loadingRecent ? <p>Loading...</p> : (
                    <ul>
                        {recentPages.map((wp) => (
                            <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                                <Link href={`/wiki/${wp.wikiSlug}`}>
                                    <button><strong>{wp.name} Wiki*</strong></button>
                                </Link>
                                <small>（{new Date(wp.updated_at).toLocaleString()}）</small>
                            </li>
                        ))}
                    </ul>
                )}
                </div>
            </div>
            )}
            <br />
            <button onClick={goCreateWiki}>
                <span>
                    ＋ 新しいWikiを作る
                </span>
            </button>
        </>
    );
}