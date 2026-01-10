import styles from '@/css/index.min.module.css';

interface MenuJpProps {
    handleClick: () => void;
    menuStatus: boolean;
}

export default function MenuJp({ handleClick, menuStatus }: MenuJpProps){
    const MenuJpPage = () => {
        return(
            <nav className={styles.pSpNav} id="p-sp-nav" style={{display: menuStatus ? 'block' : 'none', zIndex: menuStatus ? 9999 : -9999}}>
                <div className={styles.pSpNav__title}>
                    メニュー
                    <div className={`${styles.pSpNav__btnClose}`} onClick={handleClick}>×</div>
                </div>
                <div className={styles.pSpNav__register}>
                    <a className={`${styles.btn} ${styles.btnPrimary} ${styles.col12}`} href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">ログイン/新規登録</a>
                </div>
                <ul className={styles.pSpNav__list}>
                    <li className={styles.pSpNav__item}>
                        <a href="/">ホーム</a>
                    </li>
                    <li className={styles.pSpNav__item}>
                        <a href="/members">あさクラメンバー一覧</a>
                    </li>
                </ul>
                <ul className={styles.pSpNav__list}>
                    <li className={styles.pSpNav__item}>
                        <a href="/wiki/sample">サンプルWiki</a>
                    </li>
                </ul>
                <ul className={styles.pSpNav__list}>
                    <li className={styles.pSpNav__item}>
                        <a href="/about/ad">広告について</a>
                    </li>
                </ul>
                <ul className={styles.pSpNav__list}>
                    <li className={styles.pSpNav__item}>
                        <a href="/policies">利用規約</a>
                    </li>
                    <li className={styles.pSpNav__item}>
                        <a href="/privacy">プライバシーポリシー</a>
                    </li>
                    <li className={styles.pSpNav__item}>
                        <a href="/about">当レンタルWikiについて</a>
                    </li>
                </ul>
            </nav>
        )
    }
    return <MenuJpPage/>
}