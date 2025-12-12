import versions from "@/utils/version";
import styles from '@/css/index.min.module.css';
import Link from "next/link";
import { LoginedUIProps } from "@/utils/pageParts/top/jp/indexLogined";

export default function LoginedUI(
{
    wiki13ninstudioCounter,
    wiki13ninstudioCounterTotal,
    loadingLiked,
    likedWikis,
    H2Styles,
    loading,
    pages,
    goCreateWiki,
}: LoginedUIProps){
    return (
        <>
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
                <i
                    className="fa-utility-fill fa-semibold fa-folder-plus"
                    style={{ fontSize: 'inherit' }}
                ></i>
                <span>＋ Создать новую Вики (японский)</span>
            </button>
        </>
    )
}