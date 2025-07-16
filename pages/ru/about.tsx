import Head from 'next/head';
import Link from 'next/link';
import styles from 'css/index.min.module.css';

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet='UTF-8'/>
                <title>Об этом вики-сайте по аренде</title>
            </Head>
            <div id="contents">
                <nav id="menu">
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
                        <Link href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">
                            <button><span>Войти/Зарегистрироваться (японский)</span></button>
                        </Link>
                        </li>
                        <li>
                        <Link href="/">
                            <button><span>日本語</span></button>
                        </Link>
                        </li>
                    </ul>
                </nav>
                <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
                    <div className={styles.pForBeginner}>
                        <h2 className={styles.pForBeginner__title}>Для новичков</h2>
                        <ul className={styles.pForBeginner__list}>
                            <li className={styles.pForBeginner__item}>
                                <a href="/wiki/sample">Образец Wiki</a>
                            </li>
                        </ul>
                    </div>
                </aside>
                <main style={{ padding: '2rem' }}>
                    <h1>Об этом вики-сайте по аренде</h1>
                    <p>Эта Wiki (далее именуемая Asakura Wiki)</p>
                    <p>Открытый исходный код, например<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a></p>
                    <p>Наша цель — предоставить простую в использовании услугу аренды Wiki.</p>
                    <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>Источник здесь</a></p>
                </main>
                <footer className={styles.footer}>
                    <div style={{textAlign: "center"}}>
                        <p>Copyright 2025 13ninstudio All rights Reserved</p>
                        <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}