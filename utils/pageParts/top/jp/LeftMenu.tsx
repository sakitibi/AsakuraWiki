import styles from '@/css/index.module.css';
import Link from 'next/link';

interface Props {
    URL: string;
    rupages?: string; // 任意プロパティ
}

export default function LeftMenuJp({ URL, rupages }: Props){
    return(
        <div id="menu">
            <nav className={styles.menu}>
                <ul id="menu-list">
                    <li>
                        <Link href="/">
                            <button><span>ホーム</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/news">
                            <button><span>あさクラニュース</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/login/redir">
                            <button><span>ログイン/新規登録</span></button>
                        </Link>
                    </li>
                    {rupages !== "false" ? (
                        <li>
                            <Link href={`/ru${URL}`}>
                                <button>
                                    <span>ロシア語</span>
                                </button>
                            </Link>
                        </li>
                    ) : (
                        null
                    )}
                </ul>
            </nav>
        </div>
    )
}