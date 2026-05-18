import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Custom404Props{
    isEmbed?: "false" | "true"
}

export default function Custom404({
    isEmbed
}: Custom404Props) {
    if(isEmbed !== "true"){
        isEmbed = "false"
    }
    const [pathname, setPathname] = useState<string | null>(null);
    useEffect(() => {
        if (typeof location !== "undefined") {
            setPathname(location.pathname);
        }
    }, []);
    return (
        <>
            <Head>
                <meta name='robots' content='noindex, follow' />
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.static.css"/>
                <title>404 Not Found</title>
            </Head>
            <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div className="article text-center">
                    <h1>404 Not Found</h1>
                    <p>
                        <img src="https://sakitibi.github.io/AsakuraWiki-Images/yuinel.png"
                            width="180"
                            height="180"
                            style={{display: "inline-block"}}
                        />
                    </p>
                    <p>ごめんなさい。</p>
                    <p>お探しのページ( {pathname} )が見つかりませんでした。</p>
                    <Link href="/">
                        <button>
                            <span>トップへ戻る</span>
                        </button>
                    </Link>
                </div>
            </main>
            {isEmbed !== "true" ? <FooterJp/> : null}
        </>
    );
}