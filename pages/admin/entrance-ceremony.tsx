import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';

// 演出設定の型定義
type Phase = 'WAITING' | 'OPENING' | 'SPEECH' | 'SURPRISE' | 'CLOSING';

interface CeremonyConfig {
    label: string;
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
    color: string;
}

// 演出ボタンのプリセット設定
const CEREMONY_STEPS: CeremonyConfig[] = [
    { 
        label: '待機開始', 
        phase: 'WAITING', 
        message: '開式まで少々お待ちください', 
        color: 'bg-slate-500' 
    },
    { 
        label: '開式（ファンファーレ）', 
        phase: 'OPENING', 
        message: 'ただいまより、式典を執り行います', 
        soundFile: 'opening_fanfare.mp3', 
        color: 'bg-blue-600' 
    },
    { 
        label: '祝辞・辞令交付', 
        phase: 'SPEECH', 
        message: '辞令交付ならびに祝辞', 
        color: 'bg-indigo-600' 
    },
    { 
        label: 'サプライズ（祝砲・拍手）', 
        phase: 'SURPRISE', 
        message: 'おめでとうございます！', 
        soundFile: 'applause.mp3', 
        triggerConfetti: true, 
        color: 'bg-pink-600' 
    },
    { 
        label: '閉式', 
        phase: 'CLOSING', 
        message: '本日は誠におめでとうございました', 
        soundFile: 'closing_bgm.mp3', 
        color: 'bg-slate-800' 
    },
];

export default function AdminControlPage() {
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
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

        return () => {
            document.body.classList.remove('ceremony');
        };
    }, []);

    const asakura_member_list_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);

    const executeTrigger = async (config: CeremonyConfig) => {
        setLoading(true);
        try {
            // 1. DBの更新（後から入った人やリロード対策）
            // テーブル名 'ceremony_state'、id: 1 のレコードを更新する想定
            const { error: dbError } = await supabaseClient
                .from('ceremony_state')
                .update({ 
                    current_phase: config.phase, 
                    message: config.message,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 1);

            if (dbError) throw dbError;

            // 2. Broadcastの送信（現在繋がっている人への即時命令）
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
                    // 送信後にチャンネルを解除
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
                <div className="min-h-screen bg-gray-100 p-8">
                    <div className="max-w-2xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">式典進行コントロールパネル</h1>
                            <p className="text-sm text-gray-500">ボタンを押すと全参加者の画面が即座に更新されます</p>
                        </header>

                        <div className="grid gap-4">
                        {CEREMONY_STEPS.map((step) => (
                            <button
                                key={step.phase}
                                disabled={loading}
                                onClick={() => executeTrigger(step)}
                                className={`flex items-center justify-between p-6 rounded-lg shadow-sm text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 ${step.color}`}
                            >
                                <div className="text-left">
                                    <span className="block text-xs opacity-80 font-mono">{step.phase}</span>
                                    <span className="text-xl font-bold">{step.label}</span>
                                </div>
                                <div className="text-right text-sm opacity-90 italic">
                                    {step.soundFile ? '🎵 ' + step.soundFile : '静音'}
                                    {step.triggerConfetti && ' ✨エフェクト'}
                                </div>
                            </button>
                        ))}
                        </div>

                        {lastAction && (
                            <div className="mt-8 p-4 bg-green-100 text-green-800 rounded text-center animate-pulse">
                                最終実行: <strong>{lastAction}</strong> (完了)
                            </div>
                        )}

                        <section className="mt-12 p-6 bg-white rounded-lg border border-red-200">
                            <h3 className="text-red-600 font-bold mb-4">緊急・自由メッセージ送信</h3>
                            <textarea 
                                id="manual-msg"
                                className="w-full border p-2 rounded mb-2"
                                placeholder="自由なテキストを入力..."
                            />
                            <button 
                                onClick={() => {
                                const el = document.getElementById('manual-msg') as HTMLTextAreaElement;
                                executeTrigger({
                                    label: '緊急メッセージ',
                                    phase: 'SPEECH',
                                    message: el.value,
                                    color: 'bg-red-600'
                                });
                                }}
                                className="w-full bg-red-600 text-white py-2 rounded font-bold"
                            >
                                テロップのみ即時更新
                            </button>
                        </section>
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