import Head from 'next/head';
import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function NewsPage() {
    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate'
    }
    return (
        <>
            <Head>
                <title>2025/07/16 あさクラ南東部で強風被害が出ています、ご注意下さい</title>
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
                                <Link href="/ru/news/2025-07-16-1">
                                    <button><span>ロシア語</span></button>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/16 あさクラ南東部で強風被害が出ています、ご注意下さい</h1>
                        <p>2025/07/15 16:00ごろ Train Builderワールド近海で強風が発生いたしました</p>
                        <p>2025/07/16 14:50ごろにあさクラ本土に上陸したと見ています</p>
                        <p>この影響で一部の地域で遅れや運転見合わせなどが発生しています</p>
                        <p>Train Builder .. 和音GAMES .. おどみんクラフト .. あさクラ .. と通った後に最終的には右上に抜けて行きました</p>
                        <p>進路は以下の通り</p>
                        <div id="img">
                            <img alt="進路" src="/images/2025-07-16 15.34.00.png"/>
                        </div>
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