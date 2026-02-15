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
                        <p>現在のメンバー数: 36人 2人審査中</p>
                        <ul className='list1'>
                            <li><a href="https://youtube.com/channel/UCJcP2mfDCtKnADrbDDjT_8g/?sub_confirmation=1">さきちび(管理者) 2021年1月1日参加</a>
                                <ul className='list2'>
                                    <li><a href="https://youtube.com/@otibinominecraft">つばきちゃん 2021年1月1日参加</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">つばきくん 2021年1月1日参加</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">つばきつばきちゃん 2021年1月1日参加</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@SHIMAJIROCH">あげるくん(副管理者) 2023年1月26日参加</a>
                                <ul className='list2'>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>あげるちゃん 2023年1月26日参加</a></li>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>あみりい 2023年1月26日参加</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@HikakinGames">ヒカキン 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@28Games28">28(ふたば) 2023年2月1日参加</a></li>
                            <li><a href='https://youtube.com/@72なつちゃんねる'>72(なつ) 2023年2月1日参加</a></li>
                            <li><a href='https://youtube.com/@tiropino'>ちろぴの 2023年2月1日参加</a></li>
                            <li><a href='https://youtube.com/@mkgamech'>MK 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@WaonGames">和音GAMES / わおんげーむず 2023年2月1日参加 2024年8月1日脱退</a></li>
                            <li><a href='https://youtube.com/@Memento-mori'>めめんともり 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@Latte1729">Latte 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@upapalon25">ウパパロン 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@gusao_gusarin">三枝りん 2023年2月1日参加</a></li>
                            <li><a href='https://youtube.com/@Mizore471'>みぞれ 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@HinaRuka21">ひなにい 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@S_Reimari">Sレイマリ 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@zennkopasu">ぜんこぱす 2023年2月1日参加</a></li>
                            <li><a href='https://youtube.com/@meteor_s7'>メテヲ 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@HachimanD">八幡宮 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@GGunmas">ガンマス 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@iemon2353">iemon 2023年2月1日参加</a></li>
                            <li><a href="https://youtube.com/@laloryukkuri">レイラー 2023年2月1日参加</a></li>
                            <li><a href="https://www.youtube.com/channel/UCybjdcp-MGis0LYEP9kGRFA">まりょ(URLリンク切れ) 2023年2月1日参加 2025年3月3日脱退</a></li>
                            <li><a href="https://youtube.com/@anakena.M">アナケナ・ファミリー 2023年3月1日参加</a></li>
                            <li><a href="https://youtube.com/@chaaaco">茶子 2025年3月4日参加</a></li>
                            <li><a href="https://discord.gg/zbvXxCWcg6">匿名 2025年8月12日参加</a></li>
                            <li><a href='https://youtube.com/@yuinel'>ゆいねる 2026年1月27日参加</a></li>
                            <li><a href='https://youtube.com/@akasakabox'>あかさかの箱 2026年1月29日参加</a></li>
                            <li><a href="https://youtube.com/@torebiru">Train Builder 2026年2月3日参加</a></li>
                            <li><a href="https://youtube.com/@DGSSEVEN">せぶーん/dgsseven 2026年2月16日参加</a></li>
                            <li>審査中</li>
                            <li>審査中</li>
                        </ul>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}