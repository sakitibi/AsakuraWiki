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
                            <li><a href="https://youtube.com/@HikakinGames">ヒカキン</a></li>
                            <li><a href="https://youtube.com/@28Games28">28(ふたば)</a></li>
                            <li><a href='https://youtube.com/@72なつちゃんねる'>72(なつ)</a></li>
                            <li><a href='https://youtube.com/@tiropino'>ちろぴの</a></li>
                            <li><a href='https://youtube.com/@mkgamech'>MK</a></li>
                            <li><a href='https://youtube.com/@Memento-mori'>めめんともり</a></li>
                            <li><a href="https://youtube.com/@Latte1729">Latte</a></li>
                            <li><a href="https://youtube.com/@upapalon25">ウパパロン</a></li>
                            <li><a href="https://youtube.com/@saegusarin_0930">三枝りん</a></li>
                            <li><a href='https://youtube.com/@Mizore471'>みぞれ</a></li>
                            <li><a href="https://youtube.com/@HinaRuka21">ひなにい</a></li>
                            <li><a href="https://youtube.com/@S_Reimari">Sレイマリ</a></li>
                            <li><a href="https://youtube.com/@zennkopasu">ぜんこぱす</a></li>
                            <li><a href='https://youtube.com/@meteor_s7'>メテヲ</a></li>
                            <li><a href="https://youtube.com/@HachimanD">八幡宮</a></li>
                            <li><a href="https://youtube.com/@GGunmas">ガンマス</a></li>
                            <li><a href="https://youtube.com/@iemon2353">iemon</a></li>
                            <li><a href="https://youtube.com/@laloryukkuri">レイラー</a></li>
                            <li><a href="https://youtube.com/@anakena.M">アナケナ・ファミリー</a></li>
                            <li><a href="https://youtube.com/@chaaaco">茶子</a></li>
                            <li><a href="https://discord.gg/zbvXxCWcg6">匿名</a></li>
                        </ul>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}