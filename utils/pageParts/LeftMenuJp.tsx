import styles from 'css/index.min.module.css';
import Link from 'next/link';

export default function LeftMenuJp(){
    return(
        <div id="menu">
            <nav className={styles.menu}>
                <ul>
                    <li>
                        <Link href="/">
                            <button><span>ホーム</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/about">
                            <button><span>当レンタルWikiについて</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">
                            <button><span>ログイン/新規登録</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/ru/about">
                            <button>
                                <span>ロシア語</span>
                            </button>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}