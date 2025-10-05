import { useState } from "react";
import { decrypt, setCharset } from "@/lib/secureObfuscator";
import { useUser } from "@supabase/auth-helpers-react";
import { adminerUserId } from "@/utils/user_list";
import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';


export default function DecryptPage() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [cipherText, setCipherText] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [charset, setCharsetInput] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    const user = useUser();
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);

    async function handleDecrypt() {
        setError(null);
        setResult(null);
        try {
            if (charset) {
                setCharset(charset); // ユーザー入力 charset を反映
            }

            const plain = await decrypt(cipherText, passphrase);
            setResult(plain);
        } catch (e: any) {
            setError(e.message || "復号に失敗しました");
        }
    }

    return (
        <>
            <Head>
                <title>{adminer_user_id_list ? "ユーザーデータ難読化解除管理画面" : "403 Forbidden"}</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/admin/deobfuscated" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                        {adminer_user_id_list ? (
                            <>
                                <h1>難読化解除ページ</h1>
                                <p><a href="/admin/user_dataget" target="_blank">データ取得をして無い場合はこちらから取得して下さい</a></p>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleDecrypt();
                                }}>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label>暗号化文字列:</label>
                                        <textarea
                                            rows={6}
                                            style={{ width: "100%" }}
                                            value={cipherText}
                                            onChange={(e) => setCipherText(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label>パスフレーズ:</label>
                                        <input
                                            type="text"
                                            style={{ width: "100%" }}
                                            value={passphrase}
                                            onChange={(e) => setPassphrase(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label>Charset (省略するとデフォルト):</label>
                                        <input
                                            type="text"
                                            style={{ width: "100%" }}
                                            value={charset}
                                            onChange={(e) => setCharsetInput(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit">復号する</button>
                                </form>
                                {result && (
                                    <div style={{ marginTop: "1rem", padding: "1rem", background: "#eef" }}>
                                    <strong>復号結果:</strong>
                                    <pre>{result}</pre>
                                    </div>
                                )}
                                {error && (
                                    <div style={{ marginTop: "1rem", padding: "1rem", background: "#fee", color: "#900" }}>
                                        <strong>エラー:</strong> {error}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h1>403 Forbidden</h1>
                                <p>あなたにはこのページを表示する権限がありません、</p>
                            </>
                        )}
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
