import Head from 'next/head';
import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function NewsPage() {
    return (
        <>
            <Head>
                <title>2025/07/18 Конференция Асакура отложена из-за системных неполадок...</title>
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
                                <Link href="/news/2025-07-16-1">
                                    <button><span>日本語</span></button>
                                </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/18 Конференция Асакура<br/>отложена из-за системных неполадок...</h1>
                        <p>Причиной этого<br/>стали неверные настройки таблицы комментариев супербазы.</p>
                        <p>Встреча в Асакуре была отложена, и нам пришлось<br/>немедленно провести системное обслуживание вики-сайта Асакура.</p>
                        <p>Теперь это исправлено.</p>
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