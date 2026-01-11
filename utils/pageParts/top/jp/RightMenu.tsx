import styles from '@/css/index.min.module.css';

export default function RightMenuJp(){
    return(
        <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
            <div className={styles.pForBeginner}>
                <h2 className={styles.pForBeginner__title}>初めての方へ</h2>
                <ul className={styles.pForBeginner__list}>
                    <li className={styles.pForBeginner__item}>
                        <a href="/members">あさクラメンバー一覧</a>
                    </li>
                    <li className={styles.pForBeginner__item}>
                        <a href="/wiki/sample">サンプルWiki</a>
                    </li>
                    <li className={styles.pForBeginner__item}>
                        <a href="/minecraft/relay">マイクラリレー</a>
                    </li>
                    <li className={styles.pForBeginner__item}>
                        <a href="/minecraft/vs">マイクラバーサス</a>
                    </li>
                </ul>
            </div>
            <div className={styles.pContact}>
                <h2 className={styles.pContact__title}>サポート</h2>
                <ul className={styles.pContact__list}>
                    <li className={styles.pContact__item}>
                        <a href="/about/ad">広告について</a>
                    </li>
                    <li className={styles.pContact__item}>
                        <a href="/rules">本サービスに関する利用のルール</a>
                    </li>
                </ul>
            </div>
        </aside>
    );
}