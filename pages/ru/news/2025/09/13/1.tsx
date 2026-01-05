import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import { useState, useEffect } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
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
                <title>2025/09/1З лонамеренный вандализм, произошедший в NMNGyuri</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/13/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>
                            <i
                                className="fa-solid fa-triangle-exclamation"
                                style={{ fontSize: "inherit" }}
                            ></i>
                            2025/09/1З лонамеренный вандализм, произошедший в<br/><a href="https://youtube.com/@NMNGyuri">NMNGyuri</a>
                        </h1>
                        <p>NMNGyuri название, тем оно выгоднее у зрителя</p>
                        <p>осуществил масштабный вандализм,</p>
                        <p>Его жертв насчитывается пять,</p>
                        <p>И никто не пытался помочь пострадавшему до конца,</p>
                        <p>{company} никогда не допустит такого поступка! !</p>
                        <p>В целях противодействия такому вандализму,</p>
                        <p><a href="https://x.com/intent/tweet?text=2025%2F09%2F13%20%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E3%81%AE%E9%85%8D%E4%BF%A1%E3%81%A7%0A%E8%B5%B7%E3%81%93%E3%81%A3%E3%81%9F%E6%82%AA%E8%B3%AA%E3%81%AA%E8%8D%92%E3%82%89%E3%81%97%E8%A1%8C%E7%82%BA%0A%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E3%81%AF%E8%A6%96%E8%81%B4%E8%80%85%E3%81%A8%E5%85%B1%E3%81%AB%0A%E5%A4%A7%E8%A6%8F%E6%A8%A1%E3%81%AA%E8%8D%92%E3%82%89%E3%81%97%E8%A1%8C%E7%82%BA%E3%82%92%E8%A1%8C%E3%81%84%E3%81%BE%E3%81%97%E3%81%9F%E3%80%81%0A%E3%81%9D%E3%81%AE%E8%A2%AB%E5%AE%B3%E8%80%85%E3%81%AF5%E4%BA%BA%E3%81%A8%E6%8E%A8%E5%AE%9A%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%81%0A%E3%81%9D%E3%81%97%E3%81%A6%E8%AA%B0%E3%82%82%E8%A2%AB%E5%AE%B3%E8%80%85%E3%82%92%E6%9C%80%E5%BE%8C%E3%81%BE%E3%81%A7%E5%8A%A9%E3%81%91%E3%82%88%E3%81%86%E3%81%A8%E3%81%97%E3%81%BE%E3%81%9B%E3%82%93%E3%81%A7%E3%81%97%E3%81%9F%E3%80%81%0A%E8%87%AA%E5%88%86%E3%81%AF%E3%81%9D%E3%81%AE%E6%A7%98%E3%81%AA%E8%A1%8C%E7%82%BA%E3%82%92%E7%B5%B6%E5%AF%BE%E3%81%AB%E8%A8%B1%E3%81%97%E3%81%BE%E3%81%9B%E3%82%93%21%21%0A%E3%81%9D%E3%81%AE%E6%A7%98%E3%81%AA%E8%8D%92%E3%82%89%E3%81%97%E8%A1%8C%E7%82%BA%E3%81%AB%E5%AF%BE%E6%8A%97%E3%81%99%E3%82%8B%E7%82%BA%E3%81%AB%E3%80%81%0A%E3%81%93%E3%81%AE%E4%BA%8B%E5%AE%9F%E3%82%92%E6%8B%A1%E6%95%A3%E3%81%97%E3%81%A6%E4%B8%8B%E3%81%95%E3%81%84%E3%80%81%0A%E8%A8%BC%E6%8B%A0%E5%8B%95%E7%94%BB%20https%3A%2F%2Fyoutu.be%2FH4mPVO4pEoc%3Ft%3D7680s%0A&url=https%3A%2F%2Fyoutu.be%2FH4mPVO4pEoc%3Ft%3D7680s&hashtags=%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E6%9C%80%E4%BD%8E%21">Если у вас есть X (ранее Twitter), нажмите здесь</a></p>
                        <p><a href="https://youtu.be/H4mPVO4pEoc?t=7680s">Нажмите здесь для получения подробной информации</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}