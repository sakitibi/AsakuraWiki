import styles from 'css/index.min.module.css';
import { company } from '@/utils/version';

export default function FooterJp(){
    return(
        <footer className={styles.lFooter}>
            <div className="container">
                <ul className={styles.pFooterNav} id="p-footer-nav">
                    <li className={styles.pFooterNav__item}>
                        <a href="/policies">利用規約</a>
                    </li>
                    <li className={styles.pFooterNav__item}>
                        <a href="/privacy">プライバシーポリシー</a>
                    </li>
                    <li className={styles.pFooterNav__item}>
                        <a href="/about/ad">広告について</a>
                    </li>
                </ul>
            </div>
            <div style={{textAlign: "center"}} className={styles.cCopyright}>
                <p>Copyright 2026 {company} All rights Reserved</p>
                <p>当Wikiサービスはオープンソースプロジェクトです</p>
            </div>
        </footer>
    )
}