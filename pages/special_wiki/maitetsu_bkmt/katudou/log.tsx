import { supabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Script from "next/script";
import { asakuraMenberUserId } from '@/utils/user_list';

// Propsの型定義
interface LogProps {
    initialUser: User | null;
    htmlContent: string;
}

export default function Log({ initialUser, htmlContent }: LogProps) {
    const Disabled = () => {
        location.reload();
    };

    // ログイン中のユーザーIDがリストに含まれているか判定
    const asakura_member_list_found: string | undefined = asakuraMenberUserId.find(
        (value) => value === initialUser?.id
    );

    return (
        <>
            <Head>
                <title>マイ鉄ネット撲滅委員会活動ログ</title>
            </Head>
            <div>
                <div style={{ padding: '2rem', maxWidth: 800 }}>
                    <div>
                        <main 
                            id='contents' 
                            dangerouslySetInnerHTML={{ __html: htmlContent }} 
                        />
                    </div>
                    <br />
                    <div>
                        <button onClick={Disabled} style={{ cursor: 'not-allowed' }}>
                            <span>このページを編集</span>
                        </button>
                        <button onClick={Disabled} style={{ cursor: 'not-allowed' }}>
                            <span>このページを削除</span>
                        </button>
                    </div>
                </div>
            </div>
            {asakura_member_list_found ? null : (
                <>
                    <Script src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette_v2_main.js' />
                    <Script src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette_v2_util.js' />    
                </>
            )}
        </>
    );
}

// サーバーサイドでのデータ取得処理
export const getServerSideProps: GetServerSideProps = async (context) => {
    let user: User | null = null;
    let htmlContent = "";

    try {
        const { data: { user: authUser } } = await supabaseClient.auth.getUser();
        user = authUser;
    } catch (error) {
        console.error('[SSR Auth Error]', error);
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wiki_v3/secure-decoder`, {
            method: "GET",
            headers: {
                "X-Repo": "AsakuraWikiMetadatas",
                "X-Path": "special_wiki/maitetsu_bkmt/katudou/log"
            }
        });
        
        if (res.ok) {
            htmlContent = await res.text();
        }
    } catch (error) {
        console.error('[SSR Fetch Error]', error);
    }

    return {
        props: {
            initialUser: user,
            htmlContent: htmlContent
        }
    };
};