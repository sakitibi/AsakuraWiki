import Head from 'next/head';
import FooterJp from '@/utils/pageParts/FooterJp';

export default function Custom404() {
    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.min.css"/>
                <title>404 Not Found</title>
            </Head>
            <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div className="article text-center">
                    <h1>404 Not Found</h1>
                    <p>お探しのページは存在しません。</p>
                </div>
            </main>
            <FooterJp/>
        </>
    );
}