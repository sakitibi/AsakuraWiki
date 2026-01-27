import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function AmongusOthersRoomJoinedLogs() {

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
                <title>Amongusの13人TVの他配信者さんの部屋での試合記録</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            <h1>Amongusの13人TVの他配信者さんの部屋での試合記録</h1>
                            <p><a href="https://sakitibi.github.io/13nin.com/Amongusの13人TV部屋のルール">ルールはこちら</a></p>
                            <p>該当の他配信者さんが<a href="https://sakitibi.github.io/13nin.com/Amongusの13人TV部屋のルール">ルール</a>や<a href="/policies">利用規約</a>に違反した場合は削除されます。</p>
                            <div id="live_logs">
                                <section id="UC1HxHVAadoOwBN6k5oozGcw">
                                    <p><a href="https://youtube.com/channel/UC1HxHVAadoOwBN6k5oozGcw">國産わっふる さん</a></p>
                                    <ul>
                                        <li>
                                            <a href="https://youtu.be/4cvEH0iubLg">
                                                2026/01/27 23:57 ~ 2026/01/28 0:23 13人TV = 緑: ノイズメーカー<br/>
                                                インポスター: 黄色、ライム、グレー
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://youtu.be/4cvEH0iubLg">
                                                2026/01/27 23:37 ~ 2026/01/27 23:52 13人TV = 緑: 亡霊<br/>
                                                インポスター: 緑、バナナ、紫
                                            </a>
                                        </li>
                                    </ul>
                                </section>
                            </div>
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
