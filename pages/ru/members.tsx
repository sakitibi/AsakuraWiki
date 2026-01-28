import Head from 'next/head';
import styles from '@/css/index.module.css';
import { useEffect, useState } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';

export default function Members() {
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
                <title>Список участников Асакуры</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/members"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Список участников Асакуры</h1>
                        <p>Текущее количество участников: 33, 4 находятся на рассмотрении.</p>
                        <ul className='list1'>
                            <li><a href="https://youtube.com/channel/UCJcP2mfDCtKnADrbDDjT_8g/?sub_confirmation=1">Сакичиби (Администратор) Присоединился 1 января 2021 года.</a>
                                <ul className='list2'>
                                    <li><a href="https://youtube.com/@otibinominecraft">Цубаки-чан Присоединился 1 января 2021 года.</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">Цубаки-кун Присоединился 1 января 2021 года.</a></li>
                                    <li><a href="https://youtube.com/@otibinominecraft">ЦубакиЦубаки-чан Присоединился 1 января 2021 года.</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@SHIMAJIROCH">Агерукун (помощник администратора) Участвовал 26 января 2023 года.</a>
                                <ul className='list2'>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>Агеру-чан Участвовал 26 января 2023 года.</a></li>
                                    <li><a href='https://youtube.com/@SHIMAJIROCH'>Амири Участвовал 26 января 2023 года.</a></li>
                                </ul>
                            </li>
                            <li><a href="https://youtube.com/@HikakinGames">Хикакин Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@28Games28">28(Футаба) Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href='https://youtube.com/@72なつちゃんねる'>72(Лето) Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href='https://youtube.com/@tiropino'>Чиропино Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href='https://youtube.com/@mkgamech'>МК Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@WaonGames">Waon GAMES / Waon Games Присоединился 1 февраля 2023 г. Ушел 1 августа 2024 г.</a></li>
                            <li><a href='https://youtube.com/@Memento-mori'>Мементомори Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@Latte1729">Латте Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@upapalon25">Упапалон Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@gusao_gusarin">Рин Саэгуса Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href='https://youtube.com/@Mizore471'>Мокрый снег Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@HinaRuka21">Хинани Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@S_Reimari">С. Реймари Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@zennkopasu">Зенкопасс Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href='https://youtube.com/@meteor_s7'>Метеор Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@HachimanD">Святилище Хатимана Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@GGunmas">Гамма Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@iemon2353">кто-то Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://youtube.com/@laloryukkuri">Рейлор Участвовал 1 февраля 2023 года.</a></li>
                            <li><a href="https://www.youtube.com/channel/UCybjdcp-MGis0LYEP9kGRFA">Марио (ссылка не работает) Присоединился 1 февраля 2023 г. Ушёл 3 марта 2025 г.</a></li>
                            <li><a href="https://youtube.com/@anakena.M">Семья Анакена Участвовал 1 марта 2023 года.</a></li>
                            <li><a href="https://youtube.com/@chaaaco">Чако Участие состоялось 4 марта 2025 года.</a></li>
                            <li><a href="https://discord.gg/zbvXxCWcg6">Токумеи Присоединился 12 августа 2025 года.</a></li>
                            <li><a href='https://youtube.com/@yuinel'>Yuineru присоединился 27 января 2026 года.</a></li>
                            <li><a href='https://youtube.com/@akasakabox'>Акасака Бокс Присоединился 29 января 2026 года.</a></li>
                            <li>На рассмотрении</li>
                            <li>На рассмотрении</li>
                            <li>На рассмотрении</li>
                            <li>На рассмотрении</li>
                        </ul>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    );
}