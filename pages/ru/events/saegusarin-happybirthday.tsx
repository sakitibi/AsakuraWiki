import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/HeaderRu';
import MenuRu from '@/utils/pageParts/top/MenuRu';
import { useState } from 'react';
import LeftMenuRu from '@/utils/pageParts/top/LeftMenuRu';
import RightMenuRu from '@/utils/pageParts/top/RightMenuRu';
import FooterRu from '@/utils/pageParts/top/FooterRu';

export default function About() {
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
                        <p>Мероприятие в честь него состоится 30 сентября 2025 года!</p>
                        <p>Место проведения: <br/>перед домом Миэда Рин</p>
                        <p>Чем заняться</p>
                        <ol>
                            <li>Фейерверк</li>
                            <li>Специальные поезда (AgeruHouse ~ Saegusa)</li>
                        </ol>
                        <p>Стало</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    );
}