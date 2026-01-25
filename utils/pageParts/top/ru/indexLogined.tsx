import versions from "@/utils/version";
import styles from '@/css/index.module.css';
import Link from "next/link";
import { LoginedUIProps } from "@/utils/pageParts/top/jp/indexLogined";

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
    goCreateWiki,
}: LoginedUIProps) {

    const likedList = likedWikis.filter((wp) => wp.like_count > 0);

    return (
        <>
            <h1>АсакураWiki{versions[0]}</h1>

            {/* 閲覧数 */}
            <section id="view-counter" className="section">
                <p>Сегодняшние просмотры: {wiki13ninstudioCounter?.today ?? 0}</p>
                <p>Всего просмотров: {wiki13ninstudioCounterTotal}</p>
                <p>Вчерашние просмотры: {wiki13ninstudioCounter?.yesterday ?? 0}</p>
                <p>Сейчас онлайн: {wiki13ninstudioCounter?.online ?? 0}</p>
            </section>

            {/* みんなが評価しているWiki */}
            <section id="liked-wiki" className="section">
                <h2 className={styles.pLikedWiki__title}>Популярные Wiki</h2>

                {loadingLiked ? (
                    <p>Loading...</p>
                ) : (
                    <ul>
                        {likedList.length === 0 ? (
                            <li>Нет оценённых Wiki</li>
                        ) : (
                            likedList.map((wp) => (
                                <li key={`liked-${wp.wikiSlug}`}>
                                    <Link href={`/wiki/${wp.wikiSlug}`}>
                                        <button>
                                            <strong>{wp.name} Wiki*</strong>
                                        </button>
                                    </Link>
                                    <small>Среднее число лайков: {wp.like_count}</small>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </section>

            {/* HOTなWiki */}
            <section id="hot-wiki" className="section">
                <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>
                    Горячие Wiki
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
                <p>Пока нет страниц.</p>
            ) : (
                <section id="wikis" className="section">
                    <div id="update-wiki">
                        <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>
                            Недавно обновлённые Wiki
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
                <span>＋ Создать новую Wiki</span>
            </button>
        </>
    );
}
