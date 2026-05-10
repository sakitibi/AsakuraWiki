import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useEffect, useState, useMemo } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { JSONProps } from '../api/staff_credits';
import { brotliDecompressSync } from 'zlib';

// ユーザー情報の型定義
interface MemberData {
    id: number;
    name: string;
    kana: string;
    dept: string;
    location: string;
    seat: string;
    joined: string;
    team: string;
    birthday: string;
    intro: string;
    comment: string;
}

type BirthdayPhase = 'WAITING' | 'OPENING' | 'CAKE_TIME' | 'PRESENT' | 'CLOSING';

interface CeremonyConfig {
    label: string;
    phase: BirthdayPhase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
    color: string;
    description: string;
}

export default function BirthdayAdminPage() {
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
    const [members, setMembers] = useState<MemberData[]>([]);
    const [birthdayUser, setBirthdayUser] = useState<MemberData | null>(null);

    // 1. ログインユーザーとメンバーリストの取得
    useEffect(() => {
        // ログインチェック
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });

        // 本来は fetch('API_URL') ですが、今回は提供されたデータ形式でシミュ呈します
        // メンバーリストを取得して今日誕生日の人を特定する
        const fetchMembers = async () => {
            try {
                const headers = new Headers();
                headers.set("Authorization", process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!);
                const res = await fetch('/api/staff_credits', {
                    headers
                });
                const buffer = await res.arrayBuffer();
                const decompressed = brotliDecompressSync(buffer);
                const data = JSON.parse(decompressed.toString('utf-8'));
                setMembers(data);

                // 今日誕生日の人を判定
                const today = new Date();
                const monthDay = `${today.getMonth() + 1}月${today.getDate()}日`;
                
                const found = data.find((m: JSONProps) => m.birthday?.includes(monthDay));
                if (found) {
                    setBirthdayUser(found);
                } else {
                    // テスト用に、もし今日誕生日の人がいなければ一人目をセットする例
                    setBirthdayUser(data[0]); 
                }
            } catch (e) {
                console.error("Failed to fetch members", e);
            }
        };

        fetchMembers();
    }, []);

    // 2. 演出ボタンの設定（名前を動的に埋め込む）
    const steps: CeremonyConfig[] = useMemo(() => {
        const name = birthdayUser ? birthdayUser.name : "不明";
        
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
    }, [birthdayUser]);

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

            setLastAction(config.label);
        } catch (error) {
            console.error('Trigger Error:', error);
            alert('送信に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized && user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">403 Forbidden</h1>
                    <p className="text-gray-600">操作権限がありません。</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50/50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 border-b-2 border-orange-200 pb-4">
                    <h1 className="text-3xl font-black text-orange-900 tracking-tighter">🎂 誕生会 進行パネル</h1>
                    {birthdayUser ? (
                        <div className="mt-2 p-2 bg-white rounded-lg border border-orange-300 inline-block shadow-sm">
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">Today's Birthday</span>
                            <span className="text-lg font-bold text-slate-800">{birthdayUser.name} さん</span>
                            <span className="ml-2 text-sm text-slate-500">({birthdayUser.dept})</span>
                        </div>
                    ) : (
                        <p className="text-sm text-orange-700 font-medium italic">読み込み中...</p>
                    )}
                </header>

                <div className="grid gap-4">
                    {steps.map((step) => (
                        <button
                            key={step.phase}
                            disabled={loading}
                            onClick={() => {
                                if (window.confirm(`${step.label} を実行しますか？`)) {
                                    executeTrigger(step);
                                }
                            }}
                            className={`group relative overflow-hidden flex flex-col p-6 rounded-2xl shadow-lg text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${step.color}`}
                        >
                            <div className="flex justify-between items-start w-full mb-2">
                                <span className="text-2xl font-bold">{step.label}</span>
                                <span className="text-xs bg-black/20 px-2 py-1 rounded uppercase font-mono tracking-widest">{step.phase}</span>
                            </div>
                            <p className="text-sm opacity-90 mb-1">{step.description}</p>
                            <div className="text-xs italic opacity-70">
                                {step.soundFile ? `🎵 ${step.soundFile}` : '🔇 静音'}
                                {step.triggerConfetti && ' ✨ カラフル紙吹雪'}
                            </div>
                        </button>
                    ))}
                </div>

                {lastAction && (
                    <div className="mt-8 p-4 bg-white border-2 border-orange-500 text-orange-600 rounded-xl text-center font-bold animate-pulse shadow-md">
                        送信完了: {lastAction}
                    </div>
                )}

                <section className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-orange-200">
                    <h3 className="text-orange-800 font-bold mb-4 flex items-center gap-2">
                        <span>💬</span> 自由メッセージ
                    </h3>
                    <textarea 
                        id="birthday-msg"
                        className="w-full border border-orange-200 p-4 rounded-xl mb-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder={`${birthdayUser?.name || '〇〇'}さん、お誕生日おめでとう！`}
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