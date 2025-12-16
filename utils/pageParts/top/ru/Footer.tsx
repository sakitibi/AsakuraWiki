import styles from 'css/index.min.module.css';
import { company } from '@/utils/version';

export default function FooterRu(){
    return(
        <footer className={styles.lFooter}>
            <div className="container">
                <ul className={styles.pFooterNav} id="p-footer-nav">
                    <li className={styles.pFooterNav__item}>
                        <a href="/policies">условия обслуживания</a>
                    </li>
                    <li className={styles.pFooterNav__item}>
                        <a href="/privacy">политика конфиденциальности</a>
                    </li>
                    <li className={styles.pFooterNav__item}>
                        <a href="/about/ad">О рекламе</a>
                    </li>
                </ul>
            </div>
            <div style={{ textAlign: 'center' }} className={styles.cCopyright}>
                <p>Copyright 2025 {company} All rights Reserved</p>
                <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
            </div>
        </footer>
    )
}
