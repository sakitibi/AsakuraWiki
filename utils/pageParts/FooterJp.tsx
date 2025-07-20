import styles from 'css/index.min.module.css';

export default function FooterJp(){
    return(
        <footer className={styles.footer}>
            <div style={{textAlign: "center"}}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>当Wikiサービスはオープンソースプロジェクトです</p>
            </div>
        </footer>
    )
}