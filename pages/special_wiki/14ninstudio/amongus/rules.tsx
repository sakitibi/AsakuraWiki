import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { asakuraMenberUserId } from '@/utils/user_list';
import { fetchAndSetUser } from '@/lib/authGetUser';

export default function AmongusRoomRulesRedirect() {
    const designColor: "default" = "default";
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // ユーザー情報を取得
        fetchAndSetUser(supabaseClient, setUser);
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

    useEffect(() => {
        location.replace("https://sakitibi.github.io/14nin.com/Amongusの13人TV部屋のルール");
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
                            <p><a href="https://sakitibi.github.io/14nin.com/Amongusの14人TV部屋のルール">Amongusの13人TV部屋のルール</a></p>
                        </div>
                        <br/>
                        <div id="ad-container" style={{ textAlign: 'center' }}>
                            <iframe src="https://sakitibi.github.io/14ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                        </div>
                    </article>
                    {asakura_member_list_found ? null : (
                        <>
                            <Script
                                src='https://sakitibi.github.io/14ninadmanager.com/js/14nin_vignette_v2_main.js'
                            />
                            <Script
                                src='https://sakitibi.github.io/14ninadmanager.com/js/14nin_vignette_v2_util.js'
                            />    
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
