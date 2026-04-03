import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function AmongusRoomRulesRedirect() {

    const designColor: "default" = "default";

    // 初期表示
    useEffect(() => {
        if(typeof document !== "undefined"){
            document.body.classList.add('wiki-font');
            document.body.classList.add('default');
            return () => {
                document.body.classList.remove('wiki-font');
                document.body.classList.remove('default');
            };
        }
    }, [designColor]);

    useEffect(() => {
        location.replace("https://sakitibi.github.io/13nin.com/Amongusの13人TV部屋のルール");
    }, [])

    return (
        <>
            <Head>
                <title>Amongusの13人TV部屋のルール</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            <h1>リダイレクト</h1>
                            <p><a href="https://sakitibi.github.io/13nin.com/Amongusの13人TV部屋のルール">Amongusの13人TV部屋のルール</a></p>
                        </div>
                        <br/>
                        <div id="ad-container" style={{ textAlign: 'center' }}>
                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                        </div>
                    </article>
                    <Script src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js' />
                </div>
            </div>
        </>
    );
}
