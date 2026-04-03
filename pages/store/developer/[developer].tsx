import Head from 'next/head';
import styles from '@/css/store.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import Custom404 from '@/pages/404';
import type { AppProps } from '@/pages/store/details/[appDetails]';
import { useState } from 'react';

export interface DeveloperProps {
    user_id: string;
    developer_id: string;
    developer_name: string;
    developer_siteurl: string | null;
    official: boolean;
}

interface StorePageProps {
    apps: AppProps[];
    developers: DeveloperProps | null;
    developersStr: string;
}

export default function Store({ apps, developers, developersStr }: StorePageProps) {
    const [menuStatus, setMenuStatus] = useState(false);

    const handleClick = () => {
        setMenuStatus(prev => {
            const next = !prev;
            if (typeof document !== 'undefined') {
                document.body.style.overflow = next ? 'hidden' : '';
            }
            return next;
        });
    };

    if (!developers) return <Custom404 isEmbed="true" />;

    return (
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>{developers.developer_name} 13ninGamesStore</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL={`/store/developer/${developersStr}`} rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        {apps.length > 0 ? (
                            <>
                                <h1>{developers.developer_name}</h1>
                                {apps.map((data, index) => (
                                    <div id="developers-container" key={index}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            {data.isChecked && (
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
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {developers.developer_siteurl && (
                                    <p>
                                        <a href={developers.developer_siteurl}>このデベロッパのサイト</a>
                                    </p>
                                )}
                            </>
                        ) : (
                            <Custom404 isEmbed="true" />
                        )}
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    );
}

// -------------------- SSR --------------------
export async function getServerSideProps(context: any) {
    const { developer } = context.query;
    const developersStr: string = Array.isArray(developer) ? developer.join('/') : developer ?? '';

    if (!developersStr) {
        return { props: { apps: [], developers: null, developersStr } };
    }

    // SSR では絶対 URL が必要
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    console.log("SSR BASE_URL:", BASE_URL);
    console.log("developersStr:", developersStr);

    try {
        // apps データ取得
        const appsRes = await fetch(`${BASE_URL}/api/store/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ developer: developersStr }),
        });
        const apps: AppProps[] = appsRes.ok ? await appsRes.json() : [];
        console.log("apps:", apps);

        // developer データ取得
        const devRes = await fetch(`${BASE_URL}/api/store/developers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ developer: developersStr }),
        });
        const developers: DeveloperProps | null = devRes.ok ? await devRes.json() : null;
        console.log("developers:", developers);

        return {
            props: { apps, developers, developersStr },
        };
    } catch (err) {
        console.error('SSR fetch error:', err);
        return { props: { apps: [], developers: null, developersStr } };
    }
}
