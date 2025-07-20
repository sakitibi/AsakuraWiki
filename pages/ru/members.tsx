import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import { useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import FooterJp from '@/utils/pageParts/FooterJp';

export default function Members() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    return (
        <>
            <Head>
                <meta charSet='UTF-8'/>
                <title>Список участников Асакуры</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/members"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Список участников Асакуры</h1>
                        <ul className='list1'>
                            <li><a href="https://youtube.com/channel/UCJcP2mfDCtKnADrbDDjT_8g/?sub_confirmation=1">Сакичиби (Администратор)</a>
                                <ul className='list2'>
                                    <li><a href="https://youtube.com/@otibinominecraft">Цубаки-чан</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">Цубаки-кун</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">Чиби-чан</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@SHIMAJIROCH">Агерукун (помощник администратора)</a>
                                <ul className='list2'>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>Агеру-чан</a></li>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>Амири</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@HikakinGames">Хикакин</a></li>
                            <li><a href="https://youtube.com/@28Games28">28(Футаба)</a></li>
                            <li><a href='https://youtube.com/@72なつちゃんねる'>72(Лето)</a></li>
                            <li><a href='https://youtube.com/@tiropino'>Чиропино</a></li>
                            <li><a href='https://youtube.com/@mkgamech'>МК</a></li>
                            <li><a href='https://youtube.com/@Memento-mori'>Мементомори</a></li>
                            <li><a href="https://youtube.com/@Latte1729">Латте</a></li>
                            <li><a href="https://youtube.com/@upapalon25">Упапалон</a></li>
                            <li><a href="https://youtube.com/@saegusarin_0930">Рин Саэгуса</a></li>
                            <li><a href='https://youtube.com/@Mizore471'>Мокрый снег</a></li>
                            <li><a href="https://youtube.com/@HinaRuka21">Хинани</a></li>
                            <li><a href="https://youtube.com/@S_Reimari">С. Реймари</a></li>
                            <li><a href="https://youtube.com/@zennkopasu">Зенкопасс</a></li>
                            <li><a href='https://youtube.com/@meteor_s7'>Метеор</a></li>
                            <li><a href="https://youtube.com/@HachimanD">Святилище Хатимана</a></li>
                            <li><a href="https://youtube.com/@GGunmas">Гамма</a></li>
                            <li><a href="https://youtube.com/@iemon2353">кто-то</a></li>
                            <li><a href="https://youtube.com/@laloryukkuri">Рейлор</a></li>
                            <li><a href="https://youtube.com/@anakena.M">Семья Анакена</a></li>
                            <li><a href="https://youtube.com/@chaaaco">Чако</a></li>
                            <li><a href="https://discord.gg/zbvXxCWcg6">Токумеи</a></li>
                        </ul>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}