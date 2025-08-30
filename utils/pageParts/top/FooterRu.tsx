import styles from 'css/index.min.module.css';

export default function FooterRu(){
    return(
        <footer className={styles.footer}>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
            </div>
        </footer>
    )
}
