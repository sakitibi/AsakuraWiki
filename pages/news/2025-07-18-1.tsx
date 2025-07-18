import Head from 'next/head';
import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function NewsPage() {
    return (
        <>
            <Head>
                <title>2025/07/18 あさクラ会議がシステムトラブルで延期に..</title>
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
                                <Link href="/ru/news/2025-07-18-1">
                                    <button><span>ロシア語</span></button>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/18 あさクラ会議がシステム<br/>システムトラブルで延期に..</h1>
                        <p>その原因は「supabaseのcommentsテーブル<br/>の設定がおかしかったからです」</p>
                        <p>あさクラ会議は延期となり、<br/>すぐにあさクラWikiのシステム<br/>メンテナンスをすることになった</p>
                        <p>現在は修正されています</p>
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