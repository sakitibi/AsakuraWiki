import { supabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";
import { asakuraMenberUserId } from '@/utils/user_list';

export default function Log(){
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    useEffect(() => {
        (async function(){
            const res = await fetch("https://asakura-wiki.vercel.app/api/wiki_v3/secure-decoder", {
                method: "GET",
                headers: {
                    "X-Repo": "AsakuraWikiMetadatas",
                    "X-Path": "special_wiki/maitetsu_bkmt/katudou/log"
                }
            });
            const data = await res.text();
            document.getElementById("contents")!.innerHTML = data;
        })();
    }, []);
    const asakura_member_list_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);
    const Disabled = () => {
        location.reload();
    }
    return(
        <>
            <Head>
                <title>マイ鉄ネット撲滅委員会活動ログ</title>
            </Head>
            <div>
                <div style={{ padding: '2rem', maxWidth: 800 }}>
                    <div>
                        <main id='contents'></main>
                    </div>
                    <br />
                    <div>
                        <button onClick={Disabled} style={{cursor: 'not-allowed'}}><span>このページを編集</span></button>
                        <button onClick={Disabled} style={{cursor: 'not-allowed'}}><span>このページを削除</span></button>
                    </div>
                </div>
            </div>
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
        </>
    )
}