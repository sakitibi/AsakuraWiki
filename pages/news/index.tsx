import Head from 'next/head';
import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function NewsPage() {
    return (
        <>
            <Head>
                <title>『公式』あさクラニュース!</title>
            </Head>
            <div className={styles.contentsWrapper}>
                <div className={styles.contents}>
                    <nav className={styles.menu}>
                        <ul>
                            <li>
                                <Link href="/">
                                    <button><span>ホーム</span></button>
                                </Link>
                            </li>
                            <li>
                                <Link href="/about">
                                    <button><span>当レンタルWikiについて</span></button>
                                </Link>
                            </li>
                            <li>
                                <Link href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">
                                    <button><span>ログイン/新規登録</span></button>
                                </Link>
                            </li>
                            <li>
                                <Link href="/ru/news">
                                    <button><span>ロシア語</span></button>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>『公式』あさクラニュース!</h1>
                        <ul>
                            <li>2025/07/16 <a href="./2025-07-16-1">あさクラ南東部で強風被害が出ています、ご注意下さい</a></li>
                        </ul>
                        <small>
                            注意 ここに出て来るものはあさクラ内の話です、<br/>実際のニュースとは関係無いものもあります、
                        </small>
                    </main>
                    <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
                        <div className={styles.pForBeginner}>
                            <h2 className={styles.pForBeginner__title}>初めての方へ</h2>
                            <ul className={styles.pForBeginner__list}>
                                <li className={styles.pForBeginner__item}>
                                    <a href="/wiki/sample">サンプルWiki</a>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
                <footer className={styles.footer}>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p>Copyright 2025 13ninstudio All rights Reserved</p>
                        <p>当Wikiサービスはオープンソースプロジェクトです</p>
                    </div>
                </footer>
            </div>
        </>
    )
}