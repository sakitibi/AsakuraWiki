import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function StationNameBosyu() {
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

    return (
        <>
            <Head>
                <title>あさクラの鉄道の駅名募集案</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            <h1>あさクラの鉄道の駅名募集案</h1>
                            <p><a href="https://sakitibi-com9.webnode.jp/page/3">ここから応募!</a></p>
                            <details>
                                <summary>
                                    <h2>駅名候補欄</h2>
                                </summary>
                                <ul>
                                    <li>海木</li>
                                    <li>棖毛</li>
                                    <li>能入</li>
                                    <li>由依</li>
                                </ul>
                            </details>
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
