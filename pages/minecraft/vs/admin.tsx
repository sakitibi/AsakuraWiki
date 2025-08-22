import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import FooterJp from '@/utils/pageParts/FooterJp';
import MenuJp from '@/utils/pageParts/MenuJp';
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
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    const user = useUser();
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);
    useEffect(() => {
        if (!Teams) return; // null のときは fetch しない
        const fetchData = async () => {
            const { data, error } = await supabaseServer
                .from("minecraft_vs")
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

        if (!UserId || !UserName || !Teams) {
            console.error("UserId, UserName, Teams must be set");
            setLoading(false);
            return;
        }

        if (EditMode === "add") {
            // チーム合計を取得
            let newTeamScore = Score ?? 0;
            const { data: teamData, error: teamError } = await supabaseServer
                .from("minecraft_vs")
                .select("team_total")
                .eq("team", Teams);

            if (!teamError && teamData) {
                const sum = teamData.reduce((acc, item) => acc + (item.team_total ?? 0), 0);
                newTeamScore += sum;
            }

            const { data, error } = await supabaseServer
                .from('minecraft_vs')
                .insert([{
                    user_name: UserName,
                    user_id: UserId,
                    team: Teams,
                    score: Score,
                    team_total: newTeamScore,
                }])
                .select();

            if (error) console.error("Insert error:", error);
            else console.log("Insert result:", data);

        } else { // edit モード
            // 現在のチームの合計から対象ユーザーのスコアを計算
            let newTeamScore = Score ?? 0;
            const { data: teamData, error: teamError } = await supabaseServer
                .from("minecraft_vs")
                .select("user_id, score, team_total")
                .eq("team", Teams);

            if (!teamError && teamData) {
                // 自分の古い score を除いたチーム合計
                const sum = teamData
                    .filter(item => item.user_id !== UserId)
                    .reduce((acc, item) => acc + (item.score ?? 0), 0);
                newTeamScore += sum;
            }

            const { error } = await supabaseServer
                .from('minecraft_vs')
                .update({
                    user_name: UserName,
                    team: Teams,
                    score: Score,
                    team_total: newTeamScore
                })
                .eq('user_id', UserId); // id カラムがあれば .eq('id', id) でもOK

            if (error) console.error("Update error:", error);
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
                                <p>ユーザー追加</p>
                                <form onSubmit={AddUsers}>
                                    <label>
                                        ユーザーid(uuid)
                                        <input
                                            type="text"
                                            required
                                            onChange={(e) => setUserId(e.target.value)}
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
                                        <select
                                            onChange={(e) => setTeams(e.target.value as '赤' | '青' | '緑' | '黄')}
                                            required
                                        >
                                            <option value="赤">赤チーム</option>
                                            <option value="青">青チーム</option>
                                            <option value="緑">緑チーム</option>
                                            <option value="黄">黄チーム</option>
                                        </select>
                                    </label>
                                    <label>
                                        スコア追加(マイナスで減点)
                                        <input
                                            type="number"
                                            required
                                            onChange={(e) => setScore(Number(e.target.value))}
                                        />
                                    </label>
                                    <label>
                                        追加または編集
                                        <select
                                            onChange={(e) => setEditMode(e.target.value as 'add' | 'edit')}
                                            required
                                        >
                                            <option value="add">追加</option>
                                            <option value="edit">編集</option>
                                        </select>
                                    </label>
                                    <button type="submit">
                                        <span>ユーザーを追加 編集</span>
                                    </button>
                                </form>
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