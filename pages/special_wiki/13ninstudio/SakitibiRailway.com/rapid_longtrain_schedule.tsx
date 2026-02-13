import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function RapidLongTrainSchedule() {
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
                <title>あさクラの熱帯快速+4増結時間</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            <h1>あさクラの快速+4増結時間</h1>
                            <p>2026年2月14日以降のみ掲載しています。</p>
                            <details>
                                <summary>
                                    <h2>あさクラの快速+4増結時間</h2>
                                </summary>
                                <ul>
                                    <li>
                                        2026年2月14日 本線などの熱帯快速
                                        上り: 16:30~20:30
                                        下り: 19:30~23:00
                                        の時間帯は三枝~生津までの電車を
                                        12両(通常8+臨時+4)の連結にします
                                    </li>
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
