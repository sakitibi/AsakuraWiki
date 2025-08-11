import styles from 'css/index.min.module.css';

export default function FooterJp(){
    return(
        <footer className={styles.lFooter}>
            <div className="container">
                <ul className={styles.pFooterNav}>
                    <li className={`${styles.pFooterNav__item} style-list-none`}>
                        <a href="/policies">利用規約</a>
                    </li>
                </ul>
            </div>
            <div style={{textAlign: "center"}} className={styles.cCopyright}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>当Wikiサービスはオープンソースプロジェクトです</p>
            </div>
        </footer>
    )
}