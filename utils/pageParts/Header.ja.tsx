import styles from 'css/index.min.module.css';

export default function HeaderJa(){
    return (
        <header className={styles.lHeader}>
            <div className={styles.container}>
                <div className={`${styles.row}${styles.alignItemsCenter}${styles.justifyContentBetween}${styles.flexNowrap}`}>
                    <div className={`${styles.col4}${styles.offset3}`}>
                        <div className={styles.lHeader__controls}>
                            <div className={styles.dBlock}>
                                <div className={styles.cMobileControls}>
                                    <div className={styles.row}>
                                        <div className={styles.col6}></div>
                                        <div className={`${styles.offset1}${styles.col4}`}>
                                            <button id="menu-button" aria-expanded="false" aria-controls="sp-nav">
                                                <span className={`${styles.cMobileControls__icon}${styles.cMobileControls__iconMenu}`}>
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