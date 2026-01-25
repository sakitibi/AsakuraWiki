import Head from 'next/head';
import styles from '@/css/index.module.css';
import { useState, useEffect } from 'react';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';


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
                <title>2026/01/25 В связи с большим количеством одновременно полученных заявок на членство,</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2026/01/25/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/01/25 В связи с большим количеством одновременно полученных заявок на членство,</h1>
                        <p>Кроме того, в связи с большим количеством одновременно полученных заявок на членство,</p>
                        <p>Критерии отбора временно ужесточены.</p>
                        <p>Потому что сервер не справляется.</p>
                        <p>Кроме того, 26 января исполняется три года с момента переименования в Асакура.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}