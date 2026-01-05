import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { company } from '@/utils/version';

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
                <title>2025/09/13 名前は長い方が有利の配信で起こった悪質な荒らし行為</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/09/13/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>
                            <i
                                className="fa-solid fa-triangle-exclamation"
                                style={{ fontSize: "inherit" }}
                            ></i>
                            2025/09/13 名前は長い方が有利の配信で<br/>起こった悪質な荒らし行為
                        </h1>
                        <p>名前は長い方が有利は視聴者と共に</p>
                        <p>大規模な荒らし行為を行いました、</p>
                        <p>その被害者は5人と推定されています、</p>
                        <p>そして誰も被害者を最後まで助けようとしませんでした、</p>
                        <p>{company}はその様な行為を絶対に許しません!!</p>
                        <p>その様な荒らし行為に対抗する為に、</p>
                        <p>この事実を拡散して下さい、</p>
                        <p><a href="https://x.com/intent/tweet?text=2025%2F09%2F13%20%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E3%81%AE%E9%85%8D%E4%BF%A1%E3%81%A7%0A%E8%B5%B7%E3%81%93%E3%81%A3%E3%81%9F%E6%82%AA%E8%B3%AA%E3%81%AA%E8%8D%92%E3%82%89%E3%81%97%E8%A1%8C%E7%82%BA%0A%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E3%81%AF%E8%A6%96%E8%81%B4%E8%80%85%E3%81%A8%E5%85%B1%E3%81%AB%0A%E5%A4%A7%E8%A6%8F%E6%A8%A1%E3%81%AA%E8%8D%92%E3%82%89%E3%81%97%E8%A1%8C%E7%82%BA%E3%82%92%E8%A1%8C%E3%81%84%E3%81%BE%E3%81%97%E3%81%9F%E3%80%81%0A%E3%81%9D%E3%81%AE%E8%A2%AB%E5%AE%B3%E8%80%85%E3%81%AF5%E4%BA%BA%E3%81%A8%E6%8E%A8%E5%AE%9A%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%81%0A%E3%81%9D%E3%81%97%E3%81%A6%E8%AA%B0%E3%82%82%E8%A2%AB%E5%AE%B3%E8%80%85%E3%82%92%E6%9C%80%E5%BE%8C%E3%81%BE%E3%81%A7%E5%8A%A9%E3%81%91%E3%82%88%E3%81%86%E3%81%A8%E3%81%97%E3%81%BE%E3%81%9B%E3%82%93%E3%81%A7%E3%81%97%E3%81%9F%E3%80%81%0A%E8%87%AA%E5%88%86%E3%81%AF%E3%81%9D%E3%81%AE%E6%A7%98%E3%81%AA%E8%A1%8C%E7%82%BA%E3%82%92%E7%B5%B6%E5%AF%BE%E3%81%AB%E8%A8%B1%E3%81%97%E3%81%BE%E3%81%9B%E3%82%93%21%21%0A%E3%81%9D%E3%81%AE%E6%A7%98%E3%81%AA%E8%8D%92%E3%82%89%E3%81%97%E8%A1%8C%E7%82%BA%E3%81%AB%E5%AF%BE%E6%8A%97%E3%81%99%E3%82%8B%E7%82%BA%E3%81%AB%E3%80%81%0A%E3%81%93%E3%81%AE%E4%BA%8B%E5%AE%9F%E3%82%92%E6%8B%A1%E6%95%A3%E3%81%97%E3%81%A6%E4%B8%8B%E3%81%95%E3%81%84%E3%80%81%0A%E8%A8%BC%E6%8B%A0%E5%8B%95%E7%94%BB%20https%3A%2F%2Fyoutu.be%2FH4mPVO4pEoc%3Ft%3D7680s%0A&url=https%3A%2F%2Fyoutu.be%2FH4mPVO4pEoc%3Ft%3D7680s&hashtags=%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E6%9C%80%E4%BD%8E%21">X(旧Twitter)をお持ちである方はこちらをクリック</a></p>
                        <p><a href="https://youtu.be/H4mPVO4pEoc?t=7680s">詳細はこちら</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}