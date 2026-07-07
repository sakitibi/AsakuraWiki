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
                <title>2026/07/07 臨時列車運転のお知らせ</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/07/07/1" rupages='false'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/07/07 臨時列車運転のお知らせ</h1>
                        <p>明日は絵琳駅に多数の臨時列車が来ます</p>
                        <p>新快速 絵琳行きや入江行き、砂原行き、などと</p>
                        <p>上記の快速バージョンも運転されます(<strong>全て定期だと存在しない</strong>)。</p>
                        <p>+フッ素線 区間快速も</p>
                        <p>さらにフッ素線(快速線)に奥絵琳駅(臨時駅)が開業します。</p>
                        <p>明日に限り営業中の前列車停車します。</p>
                        <p>以下の臨時列車運転パターンの全て(と反対方向)</p>
                        <ul>
                            <li>
                                本線
                                <ol>
                                    <li>雪波・第一拠点始発 新快速 絵琳行き</li>
                                    <li>生津始発 快速 絵琳行き</li>
                                    <li>雪波・第一拠点始発 快速 絵琳行き</li>
                                    <li>ヒカキンハウス始発 ノンストップ(臨特) 絵琳行き</li>
                                    <li>北西キノコ島始発(経由: めア) ノンストップ(臨特) 絵琳行き</li>
                                    <li>きゅうのすけハウス始発 あさクライナー 絵琳方面奚川行き</li>
                                    <li>緑木川始発 Sトレイン〜あさクライナー 絵琳方面砂漠市北行き</li>
                                    <li>たいたい拠点始発(経由: 神殿,海岸) 臨時特急 入江行き</li>
                                    <li>巨大メサ村東始発 普通 巨大メサ村南行き 巨大メサ村南折り返し 新快速 奚川行き</li>
                                </ol>
                            </li>
                            <li>
                                フッ素線
                                <ol>
                                    <li>巨大メサ村東始発 普通 川本行き 川本折り返し 新快速 砂原行き</li>
                                    <li>巨大メサ村東始発 普通 レイラーハウス行き レイラーハウス留置線折り返し 新快速 砂原行き</li>
                                </ol>
                            </li>
                            <li>
                                ホウ素線
                                <ol>
                                    <li>新南泰雪村始発(経由: 南側高速,レマ,ホウ素) 臨時特急 砂漠市南行き</li>
                                </ol>
                            </li>
                        </ul>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}