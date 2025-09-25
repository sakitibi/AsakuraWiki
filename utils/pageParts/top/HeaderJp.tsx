import styles from 'css/index.min.module.css';

interface HeaderJpProps{
    handleClick: () => void;
}

export default function HeaderJp({ handleClick }: HeaderJpProps) {
    const HeaderJpPage = () => {
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
                                                <button id="menu-button" onClick={handleClick}>
                                                    <span className={styles.cMobileControls__icon}>
                                                        <img src="https://sakitibi.github.io/AsakuraWiki-Images/icon-menu-white.png" alt="メニュー" width="30" height="30"/>
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
    };
    return <HeaderJpPage/>
}