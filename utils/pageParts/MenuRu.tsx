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
            </nav>
        )
    }
    return <MenuRuPage/>
}