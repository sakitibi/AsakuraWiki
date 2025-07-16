import Head from 'next/head';
import Link from 'next/link';
import styles from 'css/index.min.module.css';

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet='UTF-8'/>
                <title>当レンタルWikiについて</title>
            </Head>
            <div id="contents-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                <div id="contents" style={{display: 'flex', flex: 1}}>
                    <div id="menu">
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
                                    <Link href="/ru/about">
                                        <button>
                                            <span>ロシア語</span>
                                        </button>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>当レンタルWikiについて</h1>
                        <p>当Wiki(以下あさクラWiki)は</p>
                        <p>オープンソースで<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a>などより</p>
                        <p>使いやすいレンタルWikiサービスを目指しています。</p>
                        <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>ソースはここ</a></p>
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
                    <div style={{textAlign: "center"}}>
                        <p>Copyright 2025 13ninstudio All rights Reserved</p>
                        <p>当Wikiサービスはオープンソースプロジェクトです</p>
                    </div>
                </footer>
            </div>
        </>
    );
}