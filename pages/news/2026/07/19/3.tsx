import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { GetServerSideProps } from 'next';
import { company } from '@/utils/version';

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
                <title>2026/07/19 広報委員会の写真撮影活動について 3ページ目</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/07/19/2" rupages='false'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/07/19 広報委員会の写真撮影活動について 3ページ目</h1>
                        <h2>前団・後団グループ分け(<a href={`/special_wiki/${company}/staff_credits`}>番号</a>呼び 委員全員)</h2>
                        <hr/><br/>
                        <details>
                            <summary>
                                前団
                            </summary>
                            <ul>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=18`}>No. 18</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=19`}>No. 19</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=20`}>No. 20</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=21`}>No. 21</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=22`}>No. 22</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=119`}>No. 119</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=120`}>No. 120</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=121`}>No. 121</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=122`}>No. 122</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=123`}>No. 123</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=124`}>No. 124</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=125`}>No. 125</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=126`}>No. 126</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=126`}>No. 127</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=141`}>No. 141</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=142`}>No. 142</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=143`}>No. 143</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=144`}>No. 144</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=145`}>No. 145</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=149`}>No. 149</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=150`}>No. 150</a></li>
                            </ul>
                        </details>
                        <hr/><br/>
                        <details>
                            <summary>
                                後団
                            </summary>
                            <ul>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=129`}>No. 129</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=130`}>No. 130</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=131`}>No. 131</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=132`}>No. 132</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=134`}>No. 133</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=134`}>No. 134</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=135`}>No. 135</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=136`}>No. 136</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=137`}>No. 137</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=138`}>No. 138</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=139`}>No. 139</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=140`}>No. 140</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=146`}>No. 146</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=147`}>No. 147</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=148`}>No. 148</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=151`}>No. 151</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=152`}>No. 152</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=154`}>No. 154</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=155`}>No. 155</a></li>
                                <li><a href={`/special_wiki/${company}/staff_credits?id=156`}>No. 156</a></li>
                            </ul>
                        </details>
                        <hr/><br/>
                        <p><a href="https://github.com/sakitibi/AsakuraWiki-Images/tree/main/BloadcastCommittee/snap-2026-schedule/part1">前団ルート</a></p>
                        <hr/><br/>
                        <p><a href="/news/2026/07/19/2">第2ページに戻る..</a></p>
                        <p>執筆: 岡本 玲奈 委員長・嵯峨根 汐莉 副委員長</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}