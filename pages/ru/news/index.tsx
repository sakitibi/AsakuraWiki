import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useEffect, useState } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import FooterRu from '@/utils/pageParts/top/ru/Footer';

export default function NewsPage() {
    const [menuStatus, setMenuStatus] = useState(false);
    useEffect(() => {
        if(typeof document !== "undefined" && typeof window !== "undefined"){
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    return (
        <>
            <Head>
                <title>『Официальные』новости Асакуры!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>『Официальные』новости Асакуры!</h1>
                        <ul>
                            <li>2025/12/22 <a href='/ru/news/2025/12/22/1'>Примерно 24-го и 25-го числа.</a></li>
                            <li>2025/11/13 <a href='/ru/news/2025/11/13/1'>Наблюдение за сильным снегопадом<br/> в районе снежного поля на западе Асакуры</a></li>
                            <li>2025/09/28</li>
                            <hr/>
                            <ol reversed>
                                <li><a href="/ru/news/2025/09/28/3">Подробности мероприятия послезавтра</a></li>
                                <li><a href="/ru/news/2025/09/28/2">Завтра участница Асакуры Чиби-чан сменит имя</a></li>
                                <li><a href="/ru/news/2025/09/28/1">Ее Величество Император и Императрица приезжают<br/> в дом моей лучшей подруги.</a></li>
                            </ol>
                            <hr/>
                            <li>2025/09/15 <a href="/ru/news/2025/09/15/1">Наконец, завтра Асакура Part 500!</a></li>
                            <li>2025/09/1З <a href="/ru/news/2025/09/13/1">лонамеренный вандализм, произошедший в NMNGyuri</a></li>
                            <li>2025/08/31 <a href="/ru/news/2025/08/31/1">元神 魔王 слишком много нарушений, поэтому он добавляется в уровень <br/>злонамеренных пользователей на уровне отчетности одним выстрелом</a></li>
                            <li>2025/08/17 <a href="/ru/news/2025/08/17/1">Хорошие новости! Кто-то<br/>вчера атаковал мою железную сеть!</a></li>
                            <li>2025/07/26 <a href='/ru/news/2025/07/26/1'>Отличные новости! Minecraft General Transportation (mgtn) забанен!</a></li>
                            <li>2025/07/23 <a href="/ru/news/2025/07/23/1">Внешний вид замка на юго-западной стороне второго города Новый город завершен!</a></li>
                            <li>2025/07/22 <a href="/ru/news/2025/07/22/1">Строится замок на юго-западной стороне второго города Нового города..</a></li>
                            <li>2025/07/18 <a href="/ru/news/2025/07/18/1">Собрание Асакура отложено из-за системных неполадок...</a></li>
                            <li>2025/07/16 <a href="/ru/news/2025/07/16/1">Сильный ветер нанес ущерб юго-востоку Асакуры, будьте осторожны</a></li>
                        </ul>
                        <small>
                            Обратите внимание, что сказанное здесь исходит из уст Асакуры и<br/>может не иметь отношения к реальным новостям.
                        </small>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}