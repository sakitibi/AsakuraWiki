import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import { useEffect, useState } from 'react';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';

export default function AboutAd() {
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
                <title>О рекламе</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/about/ad"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className="pEntry__header">
                            <h1>О рекламе</h1>
                        </header>
                        <div className="pEntry__content">
                            <p>Бесплатный прокатный сервис WIKI «Asakura Wiki» работает за счет доходов от рекламы от рекламодателей и спонсоров.<br/>Вот почему мы показываем рекламу на каждой вики, которую вы создаете.</p>
                            <h2>Часто задаваемые вопросы о рекламе</h2>
                            <div className={styles.listGroup}>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#01">Будут ли администраторы вики получать доход?</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#02">Могу ли я разместить объявление?</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#03">Почему существуют ограничения на рекламу?</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#04">Почему я вижу так много объявлений на некоторых вики и страницах?</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#05">Можно ли убрать показ рекламы за отдельную плату?</a>
                            </div>
                            <h2 id="01">Будут ли администраторы вики получать доход?</h2>
                            <p>Не только администратор, но и пользователь не получит никакой компенсации.</p>
                            <h2 id="02">Могу ли я разместить объявление?</h2>
                            <p>Я могу. Коммерческая реклама (баннерная реклама, текстовая реклама, партнерская реклама и т. д.)<br/> или предложения услуг, или связанный с ними контент могут быть размещены, если контент<br/>не запрещен.</p>
                            <h2 id="03">Почему существуют ограничения на рекламу?</h2>
                            <p>Этот сервис предназначен для использования несколькими людьми для совместного создания веб-сайта,<br/> и любой может легко создавать, изменять и удалять страницы.</p>
                            <p>Имея возможность размещать рекламу, мы обеспечиваем бизнес-стратегию человека, разместившего объявление.<br/>Кроме того, некоторые рекламные объявления ограничены с целью<br/>улучшения качества контента и стабильной работы вики. (Мы стабильно работаем уже более 5 месяцев.)</p>
                            <h2 id="04">Почему я вижу так много объявлений на некоторых вики и страницах?</h2>
                            <p>Сервис надлежащим образом управляет серверными и сетевыми ресурсами и<br/>принимает меры для поддержания комфортной среды для всех пользователей. Это может привести<br/> к увеличению показа рекламы для компенсации<br/> эксплуатационных расходов, особенно на более тяжелых страницах и вики.</p>
                            <p>Это связано с тем, что страницы с большими объемами передачи данных или обработки ресурсоемкого контента <br/>(например, интенсивное использование изображений, интенсивная обработка данных и т. д.) будут<br/>создавать большую нагрузку на сервер и потреблять больше ресурсов, чем обычно.</p>
                            <p>Серверы и сети имеют ограниченные ресурсы. Мы просим Вашего сотрудничества в<br/> использовании объекта надлежащим образом для бесперебойной работы.</p>
                            <h2 id="05">Можно ли убрать показ рекламы за отдельную плату?</h2>
                            <p>Участники Asakura могут удалять рекламу.</p>
                            <p>Участники, которые активно участвуют в вики, могут получить приглашение стать участником Asakura.</p>
                            <p>Обратите внимание, что этот сервис представляет собой систему учетных записей, поэтому не составит<br/> труда определить, ограничены ли файлы cookie браузера, локальное хранилище и сессионное хранилище или<br/>они сброшены.</p>
                        </div>
                        <div className={`${styles.panel} ${styles.panelSuccess}`} style={{ marginTop: '30px'}}>
                            <div className={styles.panelHeading}>
                                <i className="fa-solid fa-landmark fa-fw fa-lg"></i>
                                Социальный вклад в доходы от рекламы
                            </div>
                            <div className={styles.panelBody}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ minWidth: '80px' }}>
                                        <img
                                            src="https://sakitibi.github.io/AsakuraWiki-Images/menbers/chaaaco.png"
                                            width="80px"
                                            height="80px"
                                            alt='sorry'
                                        />
                                    </div>
                                    <div style={{ minWidth: '200px' }}>
                                        <p>Часть доходов от рекламы, полученных от этого сервиса, надлежащим<br/> образом используется для покрытия расходов критики NMNGyuri и<a href="/special_wiki/maitetsu_bkmt">MaitetsuNet</a><br/>Мы надеемся, что благодаря доходам от рекламы мы<br/> сможем сказать вам, что ваше использование способствует критике NMNGyuri & MaitetsuNet.<br/></p>
                                        <p>Мы продолжим делать все возможное, чтобы предоставлять услуги, которые соответствуют доверию наших клиентов.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    );
}