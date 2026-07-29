import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { Phase } from '@/pages/events/graduation-ceremony'; // 退社式用Phase

interface CeremonyConfig {
    label: string;
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
    color: string;
    description: string;
}

// 退社式専用の演出設定
const RETIREMENT_STEPS: CeremonyConfig[] = [
    { 
        label: '待機開始', 
        phase: 'WAITING', 
        message: '退社式 開始まで少々お待ちください', 
        color: 'bg-slate-600',
        description: 'BGM：なし'
    },
    { 
        label: '開式宣言', 
        phase: 'OPENING', 
        message: 'これより第十四回退社式を執り行います', 
        soundFile: 'opening_fanfare.mp3', 
        color: 'bg-indigo-700',
        description: '音：クラシック曲'
    },
    { 
        label: '思い出の回想', 
        phase: 'SPEECH', 
        message: 'これまでの歩みを振り返ります', 
        color: 'bg-blue-800',
        description: '演出：なし'
    },
    { 
        label: '感謝の花束・拍手', 
        phase: 'SURPRISE', 
        message: '長年のご貢献、心より感謝いたします', 
        soundFile: 'applause_long.mp3', 
        triggerConfetti: true, 
        color: 'bg-amber-600',
        description: 'BGM：クラシック曲'
    },
    { 
        label: '門出の言葉', 
        phase: 'KADODE', 
        message: '門出の言葉 音楽: 正解', 
        soundFile: 'retirement_closing_2.mp3', 
        color: 'bg-emerald-800',
        description: 'BGM：正解'
    },
    { 
        label: '閉式', 
        phase: 'CLOSING', 
        message: '本日は誠におめでとうございました', 
        soundFile: 'closing_bgm.mp3', 
        color: 'bg-slate-800',
        description: 'BGM：幾田りら with'
    },
];

export default function RetirementAdminPage() {
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
    const [employeeInfo, setEmployeeInfo] = useState({
        no: '',
        name: '',
        kana: '',
        role: '',
        rank: 1,
    });

    const rankColors = {
        1: 'bg-blue-500',
        2: 'bg-sky-400',
        3: 'bg-green-500',
        4: 'bg-yellow-400 text-black',
        5: 'bg-orange-500',
        6: 'bg-red-600',
    } as const;

    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);

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
            // 1. DBの更新（退社式は id: 2）
            const { error: dbError } = await supabaseClient
                .from('ceremony_state')
                .upsert([{ 
                    id: 2, // 明示的にIDを指定
                    current_phase: config.phase, 
                    message: config.message,
                    updated_at: new Date().toISOString(),
                }]);

            if (dbError) throw dbError;

            // 2. Broadcastの送信
            const channel = supabaseClient.channel('ceremony_room_retirement');
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

    const sendCurrentEmployee = async () => {
        setLoading(true);

        try {
            // DB更新
            const { error } = await supabaseClient
                .from('ceremony_state')
                .update({
                    employee: employeeInfo,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', 2);

            if (error) throw error;

            // Broadcast送信
            const channel = supabaseClient.channel('ceremony_room_retirement');

            channel.subscribe(async (status) => {
                if (status !== 'SUBSCRIBED') return;

                await channel.send({
                    type: 'broadcast',
                    event: 'employee',
                    payload: employeeInfo,
                });

                supabaseClient.removeChannel(channel);
            });

            setLastAction(`退社社員送信：${employeeInfo.name}`);
        } catch (e) {
            console.error(e);
            alert('送信に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized && user) {
        return <div className="p-8"><h1>Error 403 Forbidden</h1><p>アクセス権限がありません。</p></div>;
    }

    return (
        <div className="min-h-screen bg-stone-100 p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 border-b border-stone-300 pb-4">
                    <h1 className="text-2xl font-bold text-stone-800">退社式 進行管理パネル</h1>
                    <p className="text-sm text-stone-600">参加者の画面を退社式モードで更新します</p>
                </header>

                <section className="mb-8 bg-white rounded-lg shadow border border-stone-200 p-6">

                <h2 className="font-bold text-lg mb-4">
                    現在の退社社員（カンペ確認用）
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <input
                        className="border rounded p-2"
                        placeholder="番号"
                        value={employeeInfo.no}
                        onChange={e=>setEmployeeInfo({...employeeInfo,no:e.target.value})}
                    />

                    <input
                        className="border rounded p-2 col-span-2"
                        placeholder="氏名"
                        value={employeeInfo.name}
                        onChange={e=>setEmployeeInfo({...employeeInfo,name:e.target.value})}
                    />

                    <input
                        className="border rounded p-2 col-span-2"
                        placeholder="ふりがな"
                        value={employeeInfo.kana}
                        onChange={e=>setEmployeeInfo({...employeeInfo,kana:e.target.value})}
                    />

                    <input
                        className="border rounded p-2 col-span-2"
                        placeholder="役職"
                        value={employeeInfo.role}
                        onChange={e=>setEmployeeInfo({...employeeInfo,role:e.target.value})}
                    />

                    <select
                        className="border rounded p-2 col-span-2"
                        value={employeeInfo.rank}
                        onChange={e=>setEmployeeInfo({
                            ...employeeInfo,
                            rank:Number(e.target.value)
                        })}
                    >
                        <option value={1}>🔵 その他退社社員</option>
                        <option value={2}>🩵 課長 / 上司 / 元副部長 / 元副委員長</option>
                        <option value={3}>🟢 副部長/ 副委員長 / 元委員長 / 元部長</option>
                        <option value={4}>🟡 部長 / 委員長 / 元副本部長</option>
                        <option value={5}>🟠 副本部長 / 元本部長</option>
                        <option value={6}>🔴 本部長</option>
                    </select>
                    <button
                        disabled={loading}
                        onClick={sendCurrentEmployee}
                        className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        現在の退社社員を送信
                    </button>
                </div>

                <div
                    className={`mt-5 rounded-lg p-5 text-white ${
                        rankColors[employeeInfo.rank as keyof typeof rankColors]
                    }`}
                >

                    <div className="text-3xl font-bold">
                        {employeeInfo.name || '氏名'}
                    </div>

                    <div className="text-lg">
                        {employeeInfo.kana}
                    </div>

                    <div className="mt-2 text-xl">
                        {employeeInfo.role}
                    </div>
                </div>

            </section>

                <div className="grid gap-4">
                    {RETIREMENT_STEPS.map((step) => (
                        <button
                            key={step.phase}
                            disabled={loading}
                            onClick={() => {
                                if (window.confirm(`${step.label} を実行しますか？`)) {
                                    executeTrigger(step);
                                }
                            }}
                            className={`flex items-center justify-between p-6 rounded-lg shadow-md text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 ${step.color}`}
                        >
                            <div className="text-left">
                                <span className="block text-xs opacity-70 font-mono tracking-tighter">{step.phase}</span>
                                <span className="text-xl font-bold">{step.label}</span>
                            </div>
                            <div className="text-right text-sm opacity-90 italic">
                                {step.soundFile ? '🎵 ' + step.soundFile : '静音'}
                                {step.triggerConfetti && ' ✨効果'}
                            </div>
                        </button>
                    ))}
                </div>

                {lastAction && (
                    <div className="mt-8 p-4 bg-emerald-100 text-emerald-800 rounded text-center font-bold">
                        完了: {lastAction}
                    </div>
                )}

                <section className="mt-12 p-6 bg-white rounded-lg border border-stone-200 shadow-sm">
                    <h3 className="text-stone-700 font-bold mb-4">退社式 メッセージ送信</h3>
                    <textarea 
                        id="retirement-msg"
                        className="w-full border border-stone-300 p-3 rounded mb-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="例：〇〇さん、お疲れ様でした！"
                    />
                    <button 
                        onClick={() => {
                            const el = document.getElementById('retirement-msg') as HTMLTextAreaElement;
                            executeTrigger({
                                label: '自由メッセージ',
                                phase: 'SPEECH',
                                message: el.value,
                                color: 'bg-stone-800',
                                description: 'テキストのみ更新'
                            });
                        }}
                        className="w-full bg-emerald-700 text-white py-3 rounded font-bold hover:bg-emerald-800 transition-colors"
                    >
                        メッセージを即時反映
                    </button>
                </section>
            </div>
        </div>
    );
}