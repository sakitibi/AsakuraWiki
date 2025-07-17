import Head from 'next/head';
import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function NewsPage() {
    return (
        <>
            <Head>
                <title>『Официальные』новости Асакуры!</title>
            </Head>
            <div className={styles.contentsWrapper}>
                <div className={styles.contents}>
                    <div id="menu">
                        <nav className={styles.menu}>
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
                                <Link href="/news">
                                    <button><span>日本語</span></button>
                                </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>『Официальные』новости Асакуры!</h1>
                        <ul>
                            <li>2025/07/16 <a href="/news/2025-07-16-1">Сильный ветер нанес ущерб юго-востоку Асакуры, будьте осторожны</a></li>
                        </ul>
                        <small>
                            Обратите внимание, что сказанное здесь исходит из уст Асакуры и<br/>может не иметь отношения к реальным новостям.
                        </small>
                    </main>
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
                </div>
                <footer className={styles.footer}>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p>Copyright 2025 13ninstudio All rights Reserved</p>
                        <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
                    </div>
                </footer>
            </div>
        </>
    )
}