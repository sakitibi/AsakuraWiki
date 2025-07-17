import styles from 'css/index.min.module.css';
import { useState } from 'react';

export default function HeaderJp() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleMenuOpen = () => {
        setMenuStatus((prevStatus) => !prevStatus);
        if(menuStatus === false){
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style = '';
        }
    };
    return(
        <header className={styles.lHeader}>
            <div className={styles.container}>
                <div className={`${styles.row} ${styles.alignItemsCenter} ${styles.justifyContentBetween} ${styles.flexNowrap}`}>
                    <div className={`${styles.col4} ${styles.offset3}`}>
                        <div className={styles.lHeader__controls}>
                            <div className={styles.dBlock}>
                                <div className={styles.cMobileControls}>
                                    <div className={styles.row}>
                                        <div className={styles.col6}></div>
                                        <div className={`${styles.offset1} ${styles.col4}`}>
                                            <button id="menu-button" onClick={handleMenuOpen}>
                                                <span className={styles.cMobileControls__icon}>
                                                    <img src="https://wikiwiki.jp/pa/img/icon-menu-white.png" alt="メニュー" width="30" height="30"/>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}