import styles from 'css/index.min.module.css';

export default function FooterJp(){
    return(
        <footer className={styles.lFooter}>
            <div></div>
            <div style={{textAlign: "center"}} className={styles.cCopyright}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>当Wikiサービスはオープンソースプロジェクトです</p>
            </div>
        </footer>
    )
}