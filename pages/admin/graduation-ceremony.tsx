import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabaseClient';
import { asakuraMenberUserId } from '@/utils/user_list';
import { Phase } from '@/pages/events/graduation-ceremony';

// 型定義
interface CeremonyConfig {
    label: string;
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
    color: string;
    description: string;
}

// 退社式用演出プリセット
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
        message: '門出の言葉 音楽: 旅立ちの日に', 
        soundFile: 'retirement_closing.mp3', 
        color: 'bg-emerald-800',
        description: 'BGM：旅立ちの日に'
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
    const [lastAction, setLastAction] = useState<string>('');    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);

    useEffect(() => {
        document.body.classList.add('ceremony');
        document.body.classList.add('tailwind-scope')

        return () => {
            document.body.classList.remove('ceremony');
            document.body.classList.remove('tailwind-scope');
        };
    }, []);

    const asakura_member_list_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);

    const executeTrigger = async (config: CeremonyConfig) => {
        setLoading(true);
        try {
            // 1. DB更新（リロードした人向け）
            const { error: dbError } = await supabaseClient
                .from('ceremony_state')
                .upsert([{ 
                    current_phase: config.phase, 
                    message: config.message,
                    updated_at: new Date().toISOString()
                }])
                .eq('id', 2);

            if (dbError) throw dbError;

            // 2. Broadcast送信（現在接続中の人向け）
            const channel = supabaseClient.channel('ceremony_room');
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

    return (
        <>
            {asakura_member_list_found ? (
                <div className="min-h-screen bg-gray-50 p-6 md:p-12">
                    <div className="max-w-3xl mx-auto">
                        <header className="mb-10 text-center">
                            <h1 className="text-3xl font-bold text-slate-800 font-serif">退社式 進行管理パネル</h1>
                            <p className="text-slate-500 mt-2 text-sm italic underline">※ボタンを押すと全参加者の画面がリアルタイムで動きます</p>
                        </header>

                        <div className="space-y-4">
                            {RETIREMENT_STEPS.map((step) => (
                                <button
                                    key={step.phase}
                                    disabled={loading}
                                    onClick={() => {
                                        if (window.confirm(`${step.label} を実行してもよろしいですか？`)) {
                                            executeTrigger(step);
                                        }
                                    }}
                                    className={`w-full flex flex-col md:flex-row md:items-center justify-between p-6 rounded-xl shadow-lg text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 ${step.color}`}
                                >
                                    <div className="text-left">
                                        <span className="block text-xs opacity-70 tracking-widest font-mono mb-1">{step.phase}</span>
                                        <span className="text-xl font-bold tracking-wider">{step.label}</span>
                                    </div>
                                    <div className="mt-2 md:mt-0 text-left md:text-right">
                                        <p className="text-sm font-medium border-l-2 md:border-l-0 md:border-r-2 border-white/30 px-3">
                                            {step.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* 緊急用メッセージ送信 */}
                        <div className="mt-12 p-8 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                            <h3 className="text-slate-800 font-bold mb-4 flex items-center">
                                <span className="mr-2 text-red-500">●</span> 自由テロップ送信
                            </h3>
                            <textarea 
                                id="custom-msg"
                                className="w-full border border-slate-300 p-4 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                rows={3}
                                placeholder="例：〇〇さん、本当にお疲れ様でした！"
                            />
                            <button 
                                onClick={() => {
                                    const el = document.getElementById('custom-msg') as HTMLTextAreaElement;
                                    if (!el.value) return;
                                    executeTrigger({
                                        label: '自由テロップ',
                                        phase: 'SPEECH',
                                        message: el.value,
                                        color: 'bg-slate-800',
                                        description: 'テキストのみ更新'
                                    });
                                    el.value = '';
                                }}
                                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
                            >
                                メッセージを今すぐ画面に表示
                            </button>
                        </div>

                        {lastAction && (
                            <div className="mt-8 text-center text-emerald-600 font-bold animate-bounce">
                                ✔ 前回実行: {lastAction}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <h1>Error 403 Forbidden</h1>
                    <p>アクセスする権限がありません。</p>
                </div>
            )}
        </>
    );
}