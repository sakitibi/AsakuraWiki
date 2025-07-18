import Head from 'next/head';
import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function NewsPage() {
    return (
        <>
            <Head>
                <title>2025/07/16 Сильный ветер нанес ущерб юго-востоку Асакуры , будьте осторожны.</title>
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
                        <h1>2025/07/16 Сильный ветер нанес ущерб юго-востоку<br/>Асакуры , будьте осторожны.</h1>
                        <p>Около 16:00 15 июля 2025 года в районе Train<br/>Builder World поднялся сильный ветер .</p>
                        <p>Предполагается, что тайфун обрушился на материк около 14:57 16 июля 2025 года.</p>
                        <p>Это привело к задержкам и приостановке обслуживания в некоторых районах.</p>
                        <p>Пройдя Train Builder.. Waon GAMES.. Odomin Craft..Asakura <br/> .. я наконец добрался до правого верхнего угла.</p>
                        <p>Путь следующий:</p>
                        <div id="img">
                            <img alt="Путь следующий" src="https://sakitibi.github.io/AsakuraWiki-Images/2025-07-16%2015.34.00.png" width="500" height="350"/>
                        </div>
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