import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { Phase } from '@/pages/events/entrance-ceremony';

interface CeremonyConfig {
    label: string;
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
    color: string;
}

// 入社式専用の演出設定
const ENTRANCE_STEPS: CeremonyConfig[] = [
    { 
        label: '待機開始', 
        phase: 'WAITING', 
        message: '入社式開始まで少々お待ちください', 
        color: 'bg-slate-500' 
    },
    { 
        label: '開式（ファンファーレ）', 
        phase: 'OPENING', 
        message: 'ただいまより、入社式を執り行います', 
        soundFile: 'entrance_fanfare.mp3', 
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
        message: '入社おめでとうございます！', 
        triggerConfetti: true, 
        color: 'bg-pink-600' 
    },
    { 
        label: '閉式', 
        phase: 'CLOSING', 
        message: '本日は誠におめでとうございました', 
        soundFile: 'entrance_closing.mp3', 
        color: 'bg-slate-800' 
    },
];

export default function EntranceAdminPage() {
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);

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
            // 1. DBの更新（入社式は id: 1）
            const { error: dbError } = await supabaseClient
                .from('ceremony_state')
                .upsert([{ 
                    id: 1, // 明示的にIDを指定
                    current_phase: config.phase, 
                    message: config.message,
                    updated_at: new Date().toISOString()
                }]);

            if (dbError) throw dbError;

            // 2. Broadcastの送信
            const channel = supabaseClient.channel('ceremony_room_entrance');
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
        return <div className="p-8"><h1>Error 403 Forbidden</h1><p>アクセス権限がありません。</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">入社式 進行管理パネル</h1>
                    <p className="text-sm text-gray-500">参加者の画面を入社式モードで更新します</p>
                </header>

                <div className="grid gap-4">
                    {ENTRANCE_STEPS.map((step) => (
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
                    <div className="mt-8 p-4 bg-blue-100 text-blue-800 rounded text-center animate-pulse">
                        最終実行（入社式）: <strong>{lastAction}</strong>
                    </div>
                )}

                <section className="mt-12 p-6 bg-white rounded-lg border border-blue-200">
                    <h3 className="text-blue-600 font-bold mb-4">入社式 緊急メッセージ</h3>
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
                                color: 'bg-blue-800'
                            });
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded font-bold"
                    >
                        テロップのみ送信
                    </button>
                </section>
            </div>
        </div>
    );
}