import Head from 'next/head';
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { GetServerSideProps } from 'next';

interface AppProps {
    app_title: string;
    developer: string;
    appicon_url: string;
    app_description: string | null;
    appid: string;
}

interface StoreProps {
    osusume: AppProps[];
}

export const getServerSideProps: GetServerSideProps = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/osusume_app`);
    const apps: AppProps[] = await res.json();

    const count = Math.min(apps.length, 5);
    const shuffled = [...apps].sort(() => Math.random() - 0.5);
    const osusume = shuffled.slice(0, count);

    return {
        props: {
            osusume,
        },
    };
};

export default function Store({ osusume }: StoreProps) {
    const [menuStatus, setMenuStatus] = useState(false);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = menuStatus ? 'hidden' : '';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [menuStatus]);

    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <title>13ninGamesStore</title>
            </Head>

            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />

            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />

                <div className={styles.contents}>
                    <LeftMenuJp URL="/store" rupages="false" />

                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>13ninGamesStore</h1>

                        <div id="osusume-apps">
                            <p>おすすめアプリ</p>

                            {osusume.length > 0 ? (
                                osusume.map((data) => (
                                    <div
                                        className="osusume"
                                        key={data.appid}
                                        style={{ display: 'flex' }}
                                    >
                                        <img
                                            src={data.appicon_url}
                                            alt={`${data.app_title}_icon`}
                                            width={100}
                                            height={100}
                                        />

                                        <div style={{ display: 'block' }}>
                                            <a
                                                href={`/store/details/${data.appid}`}
                                                style={{ color: 'inherit' }}
                                            >
                                                <h2>{data.app_title}</h2>
                                                <p>{data.app_description}</p>
                                                <p>
                                                    <small>{data.developer}</small>
                                                </p>
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>おすすめアプリがありません</p>
                            )}
                        </div>
                    </main>
                </div>

                <FooterJp />
            </div>
        </>
    );
}
