import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=604800, stale-while-revalidate=59'
    );

    return {
        props: {},
    };
}

export default function NewsPage() {
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
                <title>2026/07/19 広報委員会の写真撮影活動について</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/07/19/1" rupages='false'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/07/19 広報委員会の写真撮影活動について</h1>
                        <p>明日と28日に広報委員が写真撮影活動をします。</p>
                        <p>元々は22日の予定でしたが、暑さがひどいという事で延期になりました。</p>
                        <p>ページが長いのでロシア語ページは作りません。</p>
                        <hr/><br/>
                        <p>活動場所(毎年変わります): 大津市大津駅~膳所駅付近</p>
                        <hr/><br/>
                        <p>活動の進め方:</p>
                        <ul>
                            <li>撮影は前団と後団ごとに実施します。</li>
                            <li>活動状況に応じて撮影場所や担当区域を変更する場合があります。</li>
                            <li>活動中は委員同士で連携し、必要に応じて情報共有を行ってください。</li>
                            <li>活動終了後は大津駅へ戻り、撮影結果の確認を行います。</li>
                        </ul>
                        <hr/><br/>
                        <p>活動中のルール:</p>
                        <ul>
                            <li>活動時間・集合時間・解散時間を厳守してください。</li>
                            <li>貸与された撮影機材は丁寧に取り扱い、破損・紛失・盗難を防止してください。</li>
                            <li>事故・体調不良・機材トラブルが発生した場合は、<br/>直ちに委員長または副委員長へ報告してください。</li>
                            <li>熱中症予防のため、適宜休憩・水分補給を行ってください。</li>
                            <li>同じ場所でも複数の構図・角度から撮影してください。</li>
                            <li>地域住民や施設利用者への配慮を忘れず、<br/>会社の代表として節度ある行動をお願いします。</li>
                            <li>委員長・副委員長や上司などは、活動終了後に<br/>ちゃんと給料とボーナスを委員に与えて下さい(<strong>与えないと絶対にダメ</strong>)</li>
                            <li>活動中に広報委員会の活動に気づいてくれてくれた人がいたら、<br/>あいさつをしっかりしましょう。</li>
                        </ul>
                        <hr/><br/>
                        <p><a href="/news/2026/07/19/2">第2ページに続く..</a></p>
                        <p>執筆: 川崎 凜・林田 優音</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}