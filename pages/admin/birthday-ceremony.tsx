import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useEffect, useState, useMemo } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { JSONProps } from '../api/staff_credits';
import { BroadcastPayload } from '@/pages/events/birthday-ceremony';

interface CeremonyConfig extends BroadcastPayload {
    label: string;
    color: string;
    description: string;
}

export default function BirthdayAdminPage() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    // 複数人対応
    const [birthdayUsers, setBirthdayUsers] = useState<JSONProps[]>([]);
    // 特定のユーザーのみを選択してお祝いする場合用（nullなら全員）
    const [selectedUser, setSelectedUser] = useState<JSONProps | null>(null);

    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });

        const fetchMembers = async () => {
            try {
                const headers = new Headers();
                headers.set("Authorization", process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!);
                headers.set("x-data-type", "json");
                const res = await fetch('/api/staff_credits', { headers });
                const data = await res.json();

                const today = new Date();
                const monthDay = `${today.getMonth() + 1}月${today.getDate()}日`;
                
                // filterを使用して全員抽出
                const founds = data.filter((m: JSONProps) => m.birthday?.includes(monthDay));
                setBirthdayUsers(founds);
            } catch (e) {
                console.error("Failed to fetch members", e);
            }
        };

        fetchMembers();
    }, []);

    // 表示する名前の生成
    const targetName = useMemo(() => {
        if (selectedUser) return selectedUser.name;
        if (birthdayUsers.length > 0) {
            return birthdayUsers.map(u => u.name).join('さん、');
        }
        return "不明";
    }, [birthdayUsers, selectedUser]);

    const steps: CeremonyConfig[] = useMemo(() => {
        const name = targetName;
        return [
            { 
                label: '待機開始', 
                phase: 'WAITING', 
                message: `${name}さんの誕生会開始まで少々お待ちください`, 
                color: 'bg-amber-400',
                description: '入場前の待機状態'
            },
            { 
                label: '開式', 
                phase: 'OPENING', 
                message: `ハッピーバースデー！${name}さんの誕生会、スタート！`, 
                soundFile: 'happy_birthday.mp3', 
                color: 'bg-orange-500',
                description: 'BGMとともに開始'
            },
            { 
                label: 'お祝い実行', 
                phase: 'CAKE_TIME', 
                message: `${name}さん！おめでとうございます！ 🥂`, 
                triggerConfetti: true, 
                color: 'bg-pink-500',
                description: 'カラフルな紙吹雪が舞います'
            },
            { 
                label: 'プレゼント贈呈', 
                phase: 'PRESENT', 
                message: `${name}さんにみんなからプレゼントです！`, 
                color: 'bg-rose-500',
                description: '贈呈式のテロップ'
            },
            { 
                label: '閉式', 
                phase: 'CLOSING', 
                message: `${name}さんにとって素敵な一年になりますように！`, 
                color: 'bg-slate-700',
                description: '式典を締めくくります'
            },
        ];
    }, [targetName]);

    // --- 以下、ロジック部分は変更なし ---
    useEffect(() => {
        document.body.classList.add('ceremony');
        document.body.classList.add('tailwind-scope');
        return () => {
            document.body.classList.remove('ceremony');
            document.body.classList.remove('tailwind-scope');
        };
    }, []);

    const isAuthorized = asakuraMenberUserId.find(value => value === user?.id);

    const executeTrigger = async (config: CeremonyConfig) => {
        setLoading(true);
        try {
            const { error: dbError } = await supabaseClient
                .from('ceremony_state')
                .upsert([{ 
                    id: 3, 
                    current_phase: config.phase, 
                    message: config.message,
                    updated_at: new Date().toISOString()
                }]);
            if (dbError) throw dbError;

            const channel = supabaseClient.channel('ceremony_room_birthday');
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'trigger',
                        payload: {
                            phase: config.phase,
                            message: config.message,
                            soundFile: config.soundFile,
                            triggerConfetti: config.triggerConfetti,
                        },
                    });
                    supabaseClient.removeChannel(channel);
                }
            });
        } catch (error) {
            console.error('Trigger Error:', error);
            alert('送信に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized && user) return <div className="p-8 text-center">403 Forbidden</div>;

    return (
        <div className="min-h-screen bg-orange-50/50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 border-b-2 border-orange-200 pb-4">
                    <h1 className="text-3xl font-black text-orange-900 tracking-tighter">🎂 誕生会 進行パネル</h1>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                        {/* 全員選択ボタン */}
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition ${!selectedUser ? 'bg-orange-600 text-white' : 'bg-white text-orange-600 border border-orange-200'}`}
                        >
                            全員をお祝いする ({birthdayUsers.length}名)
                        </button>
                        
                        {/* 個別選択ボタン */}
                        {birthdayUsers.map(u => (
                            <button 
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition ${selectedUser?.id === u.id ? 'bg-orange-600 text-white' : 'bg-white text-orange-600 border border-orange-200'}`}
                            >
                                {u.name}さんのみ
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                        <span className="text-xs font-bold text-orange-600 uppercase block mb-1">現在のターゲット</span>
                        <p className="text-xl font-black text-slate-800">{targetName} さん</p>
                    </div>
                </header>

                {/* 演出ボタン一覧 */}
                <div className="grid gap-4">
                    {steps.map((step) => (
                        <button
                            key={step.phase}
                            disabled={loading}
                            onClick={() => window.confirm(`${step.label} を実行しますか？`) && executeTrigger(step)}
                            className={`group relative overflow-hidden flex flex-col p-6 rounded-2xl shadow-lg text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${step.color}`}
                        >
                            <div className="flex justify-between items-start w-full mb-2">
                                <span className="text-2xl font-bold">{step.label}</span>
                                <span className="text-xs bg-black/20 px-2 py-1 rounded uppercase font-mono tracking-widest">{step.phase}</span>
                            </div>
                            <p className="text-sm opacity-90">{step.description}</p>
                        </button>
                    ))}
                </div>

                {/* 自由メッセージ送信セクション */}
                <section className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-orange-200">
                    <h3 className="text-orange-800 font-bold mb-4 flex items-center gap-2">
                        <span>💬</span> 自由メッセージ ({targetName}さんへ)
                    </h3>
                    <textarea 
                        id="birthday-msg"
                        className="w-full border border-orange-200 p-4 rounded-xl mb-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder={`${targetName}さん、お誕生日おめでとう！`}
                    />
                    <button 
                        onClick={() => {
                            const el = document.getElementById('birthday-msg') as HTMLTextAreaElement;
                            if (!el.value) return;
                            executeTrigger({
                                label: '自由テロップ',
                                phase: 'SPEECH' as any,
                                message: el.value,
                                color: 'bg-orange-800',
                                description: '即時表示'
                            });
                            el.value = '';
                        }}
                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg"
                    >
                        メッセージを送信
                    </button>
                </section>
            </div>
        </div>
    );
}