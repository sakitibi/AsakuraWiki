import Head from "next/head";
import { useState, useEffect } from "react";
import MenuRu from "@/utils/pageParts/top/ru/Menu";
import HeaderRu from "@/utils/pageParts/top/ru/Header";
import LeftMenuRu from "@/utils/pageParts/top/ru/LeftMenu";
import RightMenuRu from "@/utils/pageParts/top/ru/RightMenu";
import FooterRu from "@/utils/pageParts/top/ru/Footer";
import styles from '@/css/index.module.css';

export default function CountRies() {
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
    return(
        <>
            <Head>
                <title>Республика Асакура</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuRu URL="/countries"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Республика Асакура</h1>
                        <div id="descriptions">
                            <p>Республика Асакура — государство, образованное 1 января 2021 года <br/> (первоначально называлось Республика Сакикура) .</p>
                            <p>Национальный флаг<img src="https://sakitibi.github.io/AsakuraWiki-Images/Countries/CountrieFlug.png" alt="Флаг Республики Асакура" width="500" height="350"/></p>
                            <p>В прошлом побеждал в войне мемов Джуба</p>
                        </div>
                        <img src="https://sakitibi.github.io/AsakuraWiki-Images/Countries/CountrieMap.png" alt="Карта Республики Асакура" width="500" height="350"/>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}