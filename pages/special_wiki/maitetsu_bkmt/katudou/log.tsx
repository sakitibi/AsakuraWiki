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
                        <main id='contents'>
                            <h1>マイ鉄ネット撲滅委員会活動ログ</h1>
                            <ul>
                                <li>関係無いコメント即削除 -- さきちび 2025-07-23 (水) 23:01:37</li>
                                <li>まだ始まってないのに想定外すぎるので<br/>成功ライン25に引き上げで -- みぞれ 2025-07-24 (木) 15:19:19</li>
                                <li>OK、 -- さきちび 2025-07-24 (木) 15:32:43</li>
                                <li>先ほどコメントしたはずの文章が消えているのですがなぜでしょうか？ -- aaa_ 2025-07-24 (木) 17:42:27</li>
                                <li>反逆系コメントは削除、またはコメントアウトをさせていただきます<br/>目的に反するコメントも対象<br/>ちなみにこのコメントずっと残ります(非公開で) -- さきちび 2025-07-24 (木) 17:42:46</li>
                                <li>ちなみに25超えたんで活動大成功で -- みぞれ 2025-07-24 (木) 17:46:32</li>
                                <li>やばい、大成功どころがサーバー落ちそう、<br/>まさか45以上も来ると思わんて～ -- さきちび 2025-07-24 (木) 18:07:29</li>
                                <li>これから50,75,100..の順で大成功の大が増えます -- みぞれ 2025-07-24 (木) 18:11:28</li>
                            </ul>
                        </main>
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