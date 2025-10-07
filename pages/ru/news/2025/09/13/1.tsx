import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useState } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import { company } from '@/utils/version';

export default function NewsPage() {
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
                <title>2025/09/1З лонамеренный вандализм, произошедший в NMNGyuri</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/13/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/1З лонамеренный вандализм, произошедший в<br/>NMNGyuri</h1>
                        <p>NMNGyuri название, тем оно выгоднее у зрителя</p>
                        <p>осуществил масштабный вандализм,</p>
                        <p>Его жертв насчитывается пять,</p>
                        <p>И никто не пытался помочь пострадавшему до конца,</p>
                        <p>{company} никогда не допустит такого поступка! !</p>
                        <p>В целях противодействия такому вандализму,</p>
                        <p><a href="https://x.com/intent/post?text=2025%2F09%2F13%20%D0%96%D0%B5%D1%81%D1%82%D0%BE%D0%BA%D0%B8%D0%B9%20%D1%82%D1%80%D0%BE%D0%BB%D0%BB%D0%B8%D0%BD%D0%B3%20%D0%B2%D0%BE%20%D0%B2%D1%80%D0%B5%D0%BC%D1%8F%20%D1%82%D1%80%D0%B0%D0%BD%D1%81%D0%BB%D1%8F%D1%86%D0%B8%D0%B8%20NMNGyuri%0ANMNGyuri%20%D0%B8%20%D0%B5%D0%B3%D0%BE%20%D0%B7%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D0%B8%20%D0%B7%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D0%BB%D0%B8%D1%81%D1%8C%20%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%BD%D1%8B%D0%BC%20%D1%82%D1%80%D0%BE%D0%BB%D0%BB%D0%B8%D0%BD%D0%B3%D0%BE%D0%BC.%0A%D0%9F%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5%20%D1%81%D0%BC.%20https%3A%2F%2Fasakura-wiki.vercel.app%2Fnews%2F2025%2F09%2F13%2F1%0A&url=https%3A%2F%2Fyoutu.be%2FH4mPVO4pEoc%3Ft%3D7680s&hashtags=%E5%90%8D%E5%89%8D%E3%81%AF%E9%95%B7%E3%81%84%E6%96%B9%E3%81%8C%E6%9C%89%E5%88%A9%E6%9C%80%E4%BD%8E%21">Если у вас есть X (ранее Twitter), нажмите здесь</a></p>
                        <p><a href="https://youtu.be/H4mPVO4pEoc?t=7680s">Нажмите здесь для получения подробной информации</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}