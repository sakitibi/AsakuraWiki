import Head from 'next/head';
import styles from '@/css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { NextRouter, useRouter } from 'next/router';
import Custom404 from '@/pages/404';
import type { AppProps } from '@/pages/store/details/[appDetails]';

export interface DeveloperProps{
    user_id: string;
    developer_id: string;
    developer_name: string;
    developer_siteurl: string | null;
    official: boolean;
}

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<AppProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [developers, setDevelopers] = useState<DeveloperProps | null>(null);
    const router:NextRouter = useRouter();
    const { developer } = router.query;
    // クエリ→文字列化
    const DevelopersStr:string = Array.isArray(developer) ? developer.join('/') : developer ?? '';
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

    useEffect(() => {
        const AppDataFetch = async () => {
            console.log("developer: ", developer);
            console.log("DevelopersStr: ", DevelopersStr);
            if(!DevelopersStr) return;
            const res = await fetch("/api/store/details", {
                method: 'POST',
                body: DevelopersStr
            });
            const data = await res.json();
            console.log("data: ", data);
            setApps(data); // concat不要
        };
        AppDataFetch();
    }, [DevelopersStr]);
    useEffect(() => {
        const DevDataFetch = async () => {
            console.log("developer: ", developer);
            console.log("DevelopersStr: ", DevelopersStr);
            if(!DevelopersStr) return;
            const res = await fetch("/api/store/developers", {
                method: 'POST',
                body: DevelopersStr
            });
            if(!res.ok){
                console.error("Error: ", await res.json());
                return;
            }
            const data = await res.json();
            console.log("data: ", data);
            setDevelopers(data); // concat不要
            setLoading(false);
        };
        DevDataFetch();
    }, [DevelopersStr]);

    return(
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>{developers?.developer_name} 13ninGamesStore</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL={`/store/developer/${DevelopersStr}`} rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            {loading ? (
                                <p>読み込み中</p>
                            ) : (
                                <>
                                    {apps.length > 0 ? (
                                        <>
                                            <h1>{developers?.developer_name}</h1>
                                            {apps.map((data, index) => (
                                                <>
                                                    <div id="developers-container" key={index}>
                                                        <div style={{ display: 'flex', gap: '20px' }}>
                                                            {data.isChecked ? (
                                                                <a
                                                                    className={styles.developersApplinks}
                                                                    href={`/store/details/${data.appid}`}
                                                                >
                                                                    <img
                                                                        src={data.appicon_url}
                                                                        alt={`${data.app_title}_icon`}
                                                                        width="50"
                                                                        height="50"
                                                                    />
                                                                    <h2>{data.app_title}</h2>
                                                                </a>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </>
                                            ))}
                                            {developers?.developer_siteurl ? <p><a href={developers!.developer_siteurl}>このデベロッパのサイト</a></p> : null}
                                        </>
                                    ) : (
                                        <Custom404 isEmbed="true"/>
                                    )}
                                </>
                            )}
                        </>
                    </main>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
