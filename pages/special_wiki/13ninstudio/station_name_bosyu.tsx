import { useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';
import Head from 'next/head';
import Script from 'next/script';
import { asakuraMenberUserId } from '@/utils/user_list';

export default function StationNameBosyu() {
    const designColor: "default" = "default";
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const asakura_member_list_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);
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
                                    <li>本原</li>
                                    <li>{'{地名}'}井原</li>
                                    <li>今谷</li>
                                    <li>入江</li>
                                    <li>優乃</li>
                                    <li>葵</li>
                                </ul>
                            </details>
                        </div>
                        <br/>
                        <div id="ad-container" style={{ textAlign: 'center' }}>
                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                        </div>
                    </article>
                    {asakura_member_list_found ? null : (
                        <>
                            <Script
                                src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette_v2_main.js'
                            />
                            <Script
                                src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette_v2_util.js'
                            />    
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
