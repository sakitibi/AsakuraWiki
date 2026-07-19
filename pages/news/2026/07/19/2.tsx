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
                <title>2026/07/19 広報委員会の写真撮影活動について 2ページ目</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/07/19/2" rupages='false'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/07/19 広報委員会の写真撮影活動について 2ページ目</h1>
                        <p>活動終了後</p>
                        <ul>
                            <li>撮影した写真は指定された方法で提出してください。</li>
                            <li>提出された写真は広報委員会で整理・選定・編集を行います。</li>
                            <li>選定された写真は会社のオープンWeb広報誌・広報誌・<br/>会社紹介資料等で使用する場合があります。</li>
                            <li>オープンWeb広報誌の収益は、広報委員会の運営費・委員への給料・<br/>会社内の別の部署や委員会への活動支援に活用します。</li>
                            <li>貸与された機材・備品は点検後、担当者へ返却してください。</li>
                        </ul>
                        <hr/><br/>
                        <p>活動目的</p>
                        <ul>
                            <li>会社や地域の魅力を写真で広く発信する。</li>
                            <li>公式オープンWeb広報誌・広報誌に掲載する写真を撮影する。</li>
                            <li>季節感や地域らしさが伝わる写真を収集する。</li>
                            <li>広報活動を通じて地域との交流を深める。</li>
                            <li>オープンWeb広報誌の収益を活用し、広報活動や別の部署や委員会の活動を支援する。</li>
                        </ul>
                        <hr/><br/>
                        <p>撮影テーマ</p>
                        <ul>
                            <li>街並み: 住宅街・商店街</li>
                            <li>自然: 公園・川・花・樹木・季節の風景</li>
                            <li>公共施設: 駅・公共施設・案内板</li>
                        </ul>
                        <hr/><br/>
                        <p><a href="/news/2026/07/19/1">第1ページに戻る..</a></p>
                        <p><a href="/news/2026/07/19/3">第3ページに続く..</a></p>
                        <p>執筆: 髙坂 結衣・青木 秀元</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}