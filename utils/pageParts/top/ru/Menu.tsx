import styles from 'css/index.min.module.css';

interface MenuRuProps {
    handleClick: () => void;
    menuStatus: boolean;
}

export default function MenuRu({ handleClick, menuStatus }: MenuRuProps){
    const MenuRuPage = () => {
        return(
            <nav className={styles.pSpNav} id="p-sp-nav" style={{display: menuStatus ? 'block' : 'none', zIndex: menuStatus ? 9999 : -9999}}>
                <div className={styles.pSpNav__title}>
                    меню
                    <div className={styles.pSpNav__btnClose} onClick={handleClick}>×</div>
                </div>
                <div className={styles.pSpNav__register}>
                    <a className={`${styles.btn} ${styles.btnPrimary} ${styles.col12}`} href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">Войти/Зарегистрироваться (японский)</a>
                </div>
                <ul className={styles.pSpNav__list}>
                    <li className={styles.pSpNav__item}>
                        <a href="/ru">Дом</a>
                    </li>
                    <li className={styles.pSpNav__item}>
                        <a href="/ru/members">Список участников Асакуры</a>
                    </li>
                </ul>
                <ul className={styles.pSpNav__list}>
                    <li className={styles.pSpNav__item}>
                        <a href="/wiki/sample">Образец Wiki</a>
                    </li>
                </ul>
            </nav>
        )
    }
    return <MenuRuPage/>
}