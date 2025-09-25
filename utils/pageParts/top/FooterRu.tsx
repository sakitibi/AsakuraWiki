import styles from 'css/index.min.module.css';
import { company } from '@/utils/version';

export default function FooterRu(){
    return(
        <footer className={styles.footer}>
            <div className="container">
                <ul className={styles.pFooterNav} id="p-footer-nav">
                    <li className={styles.pFooterNav__item}>
                        <a href="/policies">условия обслуживания</a>
                    </li>
                </ul>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>Copyright 2025 {company} All rights Reserved</p>
                <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
            </div>
        </footer>
    )
}
