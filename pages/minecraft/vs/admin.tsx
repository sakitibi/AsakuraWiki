import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { adminerUserId } from "@/utils/user_list";

export default function MinecraftVSAdminer(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [UserId, setUserId] = useState<any>(null);
    const [UserName, setUserName] = useState<string | null>(null);
    const [Teams, setTeams] = useState<'赤' | '青' | '緑' | '黄' | null>(null);
    const [EditMode, setEditMode] = useState<'add' | 'edit'>('add');
    const [Score, setScore] = useState<number>(0);
    const [TeamScore, setTeamScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [liveLink, setLiveLink] = useState<string | null>(null);
    useEffect(() => {
        if(typeof document !== "undefined"){
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    const user = useUser();
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);
    useEffect(() => {
        if (!Teams) return; // null のときは fetch しない
        const fetchData = async () => {
            const { data, error } = await supabaseServer
                .from("minecraft_vs_happy-ghast-sky-battle")
                .select("team_total")
                .eq("team", Teams)
                .maybeSingle();
            if (error) return console.error(error);
            if (data) setTeamScore(data.team_total);
        };
        fetchData();
    }, [Teams]);
    const AddUsers = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 必須チェック
        if (!UserId || !UserName || !Teams) {
            console.error("UserId, UserName, Teams must be set");
            setLoading(false);
            return;
        }

        try {
            if (EditMode === "add") {
                // チーム合計を取得（既存ユーザー分）
                let newTeamScore = Score ?? 0;
                const { data: teamData, error: teamError } = await supabaseServer
                    .from("minecraft_vs_happy-ghast-sky-battle")
                    .select("team_total")
                    .eq("team", Teams);

                if (teamError) throw teamError;
                if (teamData) {
                    const sum = teamData.reduce((acc, item) => acc + (item.team_total ?? 0), 0);
                    newTeamScore += sum;
                }

                // 新規ユーザー追加
                const { data, error } = await supabaseServer
                    .from("minecraft_vs_happy-ghast-sky-battle")
                    .insert([{
                        user_name: UserName,
                        user_id: UserId,
                        team: Teams ?? '赤',
                        score: Score ?? 0,
                        team_total: newTeamScore,
                        live_link: liveLink
                    }])
                    .select();

                if (error) throw error;
                console.log("Insert result:", data);

            } else { // edit モード
                // 現在のチーム合計から対象ユーザーの古い score を除く
                let newTeamScore = Score ?? 0;
                const { data: teamData, error: teamError } = await supabaseServer
                    .from("minecraft_vs_happy-ghast-sky-battle")
                    .select("user_name, score, team_total")
                    .eq("team", Teams);

                if (teamError) throw teamError;
                if (teamData) {
                    const sum = teamData
                        .filter(item => item.user_name !== UserName)
                        .reduce((acc, item) => acc + (item.score ?? 0), 0);
                    newTeamScore += sum;
                }

                // ユーザー更新
                const { error } = await supabaseServer
                    .from("minecraft_vs_happy-ghast-sky-battle")
                    .update({
                        user_name: UserName,
                        team: Teams,
                        score: Score ?? 0,
                        team_total: newTeamScore
                    })
                    .eq('user_name', UserName); // ユーザー名 を条件に更新

                if (error) throw error;
                console.log(`User ${UserName} updated`);
            }
        } catch (err: any) {
            console.error("Error in AddUsers:", err.message || err);
        }

        setLoading(false);
    };
    if (loading) return <p>読み込み中...</p>;
    return(
        <>
            <Head>
                <title>マイクラバーサス ハッピーガスト スカイバトル! 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        {adminer_user_id_list ? (
                            <>
                                <h1>マイクラバーサス ハッピーガスト スカイバトル! 管理画面</h1>
                                <div id="user_adds">
                                    <h2>ユーザー{EditMode === "edit" ? (
                                        <span>編集</span>
                                    ) : (
                                        <span>追加</span>
                                    )}
                                    </h2>
                                    <form onSubmit={AddUsers}>
                                        <label>
                                            ユーザーid(uuid)
                                            <input
                                                type="text"
                                                required
                                                onChange={(e) => setUserId(e.target.value)}
                                                disabled={EditMode === "edit"}
                                            />
                                        </label>
                                        <label>
                                            ユーザー名
                                            <input
                                                type="text"
                                                required
                                                onChange={(e) => setUserName(e.target.value)}
                                            />
                                        </label>
                                        <label>
                                            チーム
                                            <br/>
                                            <select
                                                onChange={(e) => setTeams(e.target.value as '赤' | '青' | '緑' | '黄')}
                                                required
                                            >
                                                <option value="赤" selected>赤チーム</option>
                                                <option value="青">青チーム</option>
                                                <option value="緑">緑チーム</option>
                                                <option value="黄">黄チーム</option>
                                            </select>
                                        </label>
                                        <br/>
                                        <label>
                                            スコア追加(マイナスで減点)
                                            <input
                                                type="number"
                                                required
                                                onChange={(e) => setScore(Number(e.target.value))}
                                            />
                                        </label>
                                        <label>
                                            配信リンク
                                            <input
                                                type="text"
                                                required
                                                onChange={(e) => setLiveLink(e.target.value)}
                                                disabled={EditMode === "edit"}
                                            />
                                        </label>
                                        <label>
                                            追加または編集
                                            <br/>
                                            <select
                                                onChange={(e) => setEditMode(e.target.value as 'add' | 'edit')}
                                                required
                                            >
                                                <option value="add">追加</option>
                                                <option value="edit">編集</option>
                                            </select>
                                        </label>
                                        <br/>
                                        <button type="submit">
                                            <span>ユーザーを{EditMode === "edit" ? (
                                                <span>編集</span>
                                            ) : (
                                                <span>追加</span>
                                            )}
                                            </span>
                                        </button>
                                    </form>
                                </div>
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
    )
}