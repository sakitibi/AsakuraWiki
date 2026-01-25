import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

interface Custom404Props{
    isEmbed?: "false" | "true"
}

export default function Custom404({
    isEmbed
}: Custom404Props) {
    if(isEmbed !== "true"){
        isEmbed = "false"
    }
    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.static.css"/>
                <title>404 Not Found</title>
            </Head>
            <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div className="article text-center">
                    <h1>404 Not Found</h1>
                    <p>お探しのページは存在しません。</p>
                </div>
            </main>
            {isEmbed !== "true" ? <FooterJp/> : null}
        </>
    );
}