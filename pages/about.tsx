import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet='UTF-8'/>
                <title>当レンタルWikiについて</title>
            </Head>
            <main style={{ padding: '2rem' }}>
                <h1>当レンタルWikiについて</h1>
                <p>当Wiki(以下あさクラWiki)は</p>
                <p>オープンソースで<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a>などより</p>
                <p>使いやすいレンタルWikiサービスを目指しています。</p>
                <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>ソースはここ</a></p>
            </main>
            <footer>
                <div id="menu">
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
                    </ul>
                </div>
                <div style={{textAlign: "center"}}>
                    <p>Copyright 2025 13ninstudio All rights Reserved</p>
                    <p>当Wikiサービスはオープンソースプロジェクトです</p>
                </div>
            </footer>
        </>
    );
}