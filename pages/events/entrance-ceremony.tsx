import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import { supabaseClient } from '@/lib/supabaseClient';

// 型定義
type Phase = 'WAITING' | 'OPENING' | 'SPEECH' | 'SURPRISE' | 'CLOSING';

interface BroadcastPayload {
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
}

export default function CeremonyPage() {
    const [isJoined, setIsJoined] = useState(false);
    const [phase, setPhase] = useState<Phase>('WAITING');
    const [message, setMessage] = useState('式典開始までしばらくお待ちください');
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. 初期状態の取得 (DBから)
    useEffect(() => {
        const fetchCurrentStatus = async () => {
            const { data } = await supabaseClient
                .from('ceremony_state')
                .select('*')
                .single();
            
            if (data) {
                setPhase(data.current_phase);
                setMessage(data.message);
            }
        };
        fetchCurrentStatus();
    }, []);

    // 2. Realtime 購読
    useEffect(() => {
        if (!isJoined) return;

        const channel = supabaseClient.channel('ceremony_room', {
            config: { broadcast: { self: false } }
        });

        channel
            .on('broadcast', { event: 'trigger' }, ({ payload }: { payload: BroadcastPayload }) => {
                handleRealtimeEvent(payload);
            })
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [isJoined]);

    useEffect(() => {
        document.body.classList.add('ceremony');

        return () => {
            document.body.classList.remove('ceremony');
        };
    }, []);

    // 演出実行ロジック
    const handleRealtimeEvent = (payload: BroadcastPayload) => {
        if (payload.phase) setPhase(payload.phase);
        if (payload.message) setMessage(payload.message);

        // 音声再生
        if (payload.soundFile && audioRef.current) {
            audioRef.current.src = `https://sakitibi.github.io/static.asakurawiki.com/sounds/${payload.soundFile}`;
            audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }

        // 紙吹雪
        if (payload.triggerConfetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFC0CB', '#FFD700', '#FFFFFF'] // 桜色やゴールド
            });
        }
    };

    // 入場ボタン（音声権限取得）
    const handleJoin = () => {
        setIsJoined(true);
        // 空再生でオーディオコンテキストをアクティブ化
        if (audioRef.current) {
            audioRef.current.play().catch(() => {});
        }
    };

    // 入場前の画面
    if (!isJoined) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
                <h1 className="mb-8 text-3xl font-serif">入社式 ・ 退社式 会場</h1>
                <button
                onClick={handleJoin}
                className="rounded-full bg-amber-500 px-12 py-4 text-xl font-bold transition-all hover:bg-amber-400 active:scale-95"
                >
                    会場に入場する
                </button>
                <p className="mt-4 text-sm text-slate-400">※音声をONにしてお進みください</p>
            </div>
        );
    }

    // 式典本番の画面
    return (
        <div className={`min-h-screen transition-colors duration-1000 ${
        phase === 'SURPRISE' ? 'bg-white' : 'bg-slate-50'
        }`}>
        <Head>
            <title>Ceremony Live | {phase}</title>
        </Head>

        <audio ref={audioRef} preload="auto" />

        {/* メインコンテンツ */}
        <main className="flex h-screen flex-col items-center justify-center p-4">
            {/* フェーズ表示（控えめ） */}
            <div className="absolute top-8 left-8 text-xs tracking-widest text-slate-400 uppercase">
                Current Status: {phase}
            </div>

            {/* メッセージテロップ */}
            <div className="max-w-4xl text-center">
                <p className="mb-4 text-lg text-amber-700 font-medium tracking-tighter transition-opacity duration-500">
                    {phase === 'WAITING' ? 'Welcome' : 'Live Presentation'}
                </p>
                <h2 className="text-5xl md:text-7xl font-serif leading-tight text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {message}
                </h2>
            </div>

            {/* 演出用の装飾（フェーズごと） */}
            {phase === 'OPENING' && (
                <div className="mt-12 h-1 w-24 bg-amber-500 animate-pulse" />
            )}
        </main>

        {/* 背景の装飾などはここで制御 */}
        <style jsx global>{`
            body {
                margin: 0;
                font-family: "Hiragino Mincho ProN", "MS Mincho", serif;
            }
        `}</style>
        </div>
    );
}