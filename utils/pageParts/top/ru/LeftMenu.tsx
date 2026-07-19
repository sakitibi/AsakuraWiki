import styles from '@/css/index.module.css';
import Link from 'next/link';

interface Props {
    URL: string;
}

export default function LeftMenuRu({ URL }: Props){
    return(
        <div id="menu">
            <nav className={styles.menu}>
                <ul>
                    <li>
                        <Link href="/ru">
                            <button><span>Дом</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/ru/news">
                            <button><span>Новости Асакуры</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/login/redir">
                            <button><span>Войти/<br/>Зарегистри<br/>роваться<br/> (японский)</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href={URL}>
                            <button><span>японский</span></button>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}