import Head from 'next/head';
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function Members() {
    const [menuStatus, setMenuStatus] = useState(false);
    useEffect(() => {
        if(typeof document !== "undefined"){
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
                <meta charSet='UTF-8'/>
                <title>あさクラメンバー一覧</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/members"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>あさクラメンバー一覧</h1>
                        <ul className='list1'>
                            <li><a href="https://youtube.com/channel/UCJcP2mfDCtKnADrbDDjT_8g/?sub_confirmation=1">さきちび(管理者)</a>
                                <ul className='list2'>
                                    <li><a href="https://youtube.com/@otibinominecraft">つばきちゃん</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">つばきくん</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">つばきつばきちゃん</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@SHIMAJIROCH">あげるくん(副管理者)</a>
                                <ul className='list2'>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>あげるちゃん</a></li>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>あみりい</a></li>
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
                            <li><a href="https://youtube.com/@gusao_gusarin">三枝りん</a></li>
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