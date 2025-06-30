import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet='UTF-8'/>
                <title>Об этом вики-сайте по аренде</title>
            </Head>
            <main style={{ padding: '2rem' }}>
                <h1>Об этом вики-сайте по аренде</h1>
                <p>Эта Wiki (далее именуемая Asakura Wiki)</p>
                <p>Открытый исходный код, например<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a></p>
                <p>Наша цель — предоставить простую в использовании услугу аренды Wiki.</p>
                <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>Источник здесь</a></p>
            </main>
            <footer>
                <div id="menu">
                    <ul>
                        <li>
                            <Link href="/ru">
                                <button><span>Дом</span></button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/ru/about">
                                <button><span>Об этом вики-сайте по аренде</span></button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/about"><button><span>японский</span></button></Link>
                        </li>
                    </ul>
                </div>
                <div style={{textAlign: "center"}}>
                    <p>Copyright 2025 13ninstudio All rights Reserved</p>
                    <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
                </div>
            </footer>
        </>
    );
}