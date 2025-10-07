import styles from 'css/index.min.module.css';

export default function Rightjp/Menu(){
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
                </ul>
            </div>
        </aside>
    );
}