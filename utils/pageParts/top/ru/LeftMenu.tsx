import styles from '@/css/index.min.module.css';
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
                        <Link href="/ru/about">
                            <button><span>Об этом вики-сайте по аренде</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/ru/news">
                            <button><span>Новости Асакуры</span></button>
                        </Link>
                    </li>
                    <li>
                        <Link href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">
                            <button><span>Войти/Зарегистрироваться (японский)</span></button>
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