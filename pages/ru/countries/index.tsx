import Head from "next/head";
import { useState } from "react";
import MenuRu from "@/utils/pageParts/top/MenuRu";
import HeaderRu from "@/utils/pageParts/top/HeaderRu";
import LeftMenuRu from "@/utils/pageParts/top/LeftMenuRu";
import RightMenuRu from "@/utils/pageParts/top/RightMenuRu";
import FooterRu from "@/utils/pageParts/top/FooterRu";
import styles from 'css/index.min.module.css';

export default function CountRies() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
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