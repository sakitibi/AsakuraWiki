import Head from 'next/head';
import styles from '@/css/index.module.css';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import { useEffect, useState } from 'react';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';

export default function About() {
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
                <meta charSet='UTF-8'/>
                <title>О мероприятии по случаю дня рождения участницы Asakura Рин Миэды</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/events/saegusarin-happybirthday"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>О мероприятии по случаю дня <br/>рождения участницы Asakura Рин Миэды</h1>
                        <p>Мероприятие, посвященное этому событию,<br/> состоится 30 сентября 2025 года в 19:30!</p>
                        <p>Место проведения: <br/>перед домом Миэда Рин</p>
                        <p>Чем заняться</p>
                        <ol>
                            <li>Фейерверк</li>
                            <li>Специальные поезда (AgeruHouse ~ Saegusa)</li>
                        </ol>
                        <p>Стало</p>
                        <p><a href="https://youtube.com/live/OLzvOW0wbtM">Прямая трансляция здесь</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    );
}