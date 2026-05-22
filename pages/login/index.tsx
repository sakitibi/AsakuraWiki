import Head from 'next/head';
import Link from 'next/link';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { useEffect, useState } from 'react';

interface ScaptchaSessionProps{
    data: string;
    id: string;
    created_at: string;
}

export default function LoginPage() {
    /* ===============================
        Bot 判定（state）
    =============================== */
    const [isBot, setIsBot] = useState(true);
    const [url, setUrl] = useState<URL | null>(null);
    const [scaptcha_params, setScaptcha_params] = useState<string | null>(null);
    const [scaptcha_session, setScaptcha_session] = useState<ScaptchaSessionProps | null>(null);
    const [isenabled, setIsenabled] = useState<boolean | null>(null);

    /* ===============================
        mount & bot detect
    =============================== */
    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsBot(true);
            return;
        }

        const ua = navigator.userAgent;
        const bot =
            /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

        setIsBot(bot);

        console.log('[UA]', ua);
        console.log('[isBot]', bot);
    }, []);

    useEffect(() => {
        if (isBot) return;
        setUrl(new URL(window.location.href));
    }, [isBot]);

    useEffect(() => {
        if (!url) return;
        const params = localStorage.getItem("scaptcha_params") ?? url.searchParams.get("token");
        setScaptcha_params(params);
        history.replaceState(
            { path: location.pathname },
            "",
            location.pathname
        );
    }, [url]);
    
    useEffect(() => {
        if (isBot) return;
        if (!scaptcha_params) return;
        (async function(){
            const res = await fetch("/api/scaptcha/token", {
                method: "GET",
                headers: {
                    "x-scaptcha-session": scaptcha_params!
                }
            });
            if (!res.ok) {
                console.error("Error scaptcha tokenget failed.");
                return;
            }
            setScaptcha_session(await res.json());
        })();
    }, [isBot, scaptcha_params]);

    useEffect(() => {
        if (!scaptcha_session || !scaptcha_params) {
            setIsenabled(false);
            return;
        }
        const date = new Date(scaptcha_session?.created_at).getTime();
        const now = new Date().getTime();
        (async function(){
            if (now > date + 18e5) {
                setIsenabled(false);
                const res = await fetch("/api/scaptcha/token", {
                    method: "DELETE",
                    headers: {
                        "x-scaptcha-session": scaptcha_params
                    }
                });
                localStorage.removeItem("scaptcha_params");
                if (!res.ok) {
                    console.error("Error delete failed.");
                }
                return;
            } else {
                localStorage.setItem("scaptcha_params", scaptcha_params);
                setIsenabled(true);
            }
        })();
    }, [scaptcha_session]);

    useEffect(() => {
        setTimeout(() => {
            if (isenabled === false) {
                location.replace("https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69e383ade382b0e382a4e383b3");
            }
        }, 5000);
    }, [isenabled]);

    return (
        <>
            <Head>
                <title>あさクラWikiにログイン</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
                {isenabled ? (
                    <>
                        <h1>
                            <i
                                className="fa-solid fa-key"
                                style={{ fontSize: 'inherit' }}
                            ></i>
                            ログイン
                        </h1>
                        <p>ログイン方法を選択してください：</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <Link href="/login/13nin/">
                                <button style={buttonStyle}><span>13ninアカウントでログイン(推奨)</span></button>
                            </Link>
                            <Link href="/login/13nin/secretcodes">
                                <button style={buttonStyle}><span>あさクラシークレットコードでログイン</span></button>
                            </Link>
                            <Link href="/login/github">
                                <button style={buttonStyle}><span>GitHubでログイン</span></button>
                            </Link>
                            <Link href="/login/gitlab">
                                <button style={buttonStyle}><span>GitLabでログイン</span></button>
                            </Link>
                            <Link href="/login/bitbucket">
                                <button style={buttonStyle}><span>BitBucketでログイン</span></button>
                            </Link>
                            <Link href="/login/discord">
                                <button style={buttonStyle}><span>Discordでログイン</span></button>
                            </Link>
                            <Link href="/login/figma">
                                <button style={buttonStyle}><span>Figmaでログイン</span></button>
                            </Link>
                        </div>
                    </>
                ) : isenabled === false ? (
                    <>
                        <h1>Error 403 Forbidden</h1>
                        <p>scaptchaトークンが存在しない、または不正です。</p>
                        <p>自動的にリダイレクトします。</p>
                    </>
                ) : (
                    <>
                        <h1>読み込み中..</h1>
                    </>
                )}
            </main>
            <FooterJp/>
        </>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
};