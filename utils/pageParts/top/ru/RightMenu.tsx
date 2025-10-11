import styles from 'css/index.min.module.css';

export default function RightMenuRu(){
    return(
        <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
            <div className={styles.pForBeginner}>
                <h2 className={styles.pForBeginner__title}>Для новичков</h2>
                <ul className={styles.pForBeginner__list}>
                    <li className={styles.pForBeginner__item}>
                        <a href="/ru/members">Список участников Асакуры</a>
                    </li>
                    <li className={styles.pForBeginner__item}>
                        <a href="/wiki/sample">Образец Wiki</a>
                    </li>
                </ul>
            </div>
            <div className={styles.pContact}>
                <h2 className={styles.pContact__title}>поддерживать</h2>
                <ul className={styles.pContact__list}>
                    <li className={styles.pContact__item}>
                        <a href="/about/ad">О рекламе</a>
                    </li>
                </ul>
            </div>
        </aside>
    );
}