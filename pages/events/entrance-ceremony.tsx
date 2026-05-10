import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import { supabaseClient } from '@/lib/supabaseClient';
import { useCeremonyBroadcast } from '@/hooks/useCeremonyBroadcast';

// 型定義
export type Phase = 'WAITING' | 'OPENING' | 'SPEECH' | 'SURPRISE' | 'CLOSING';

interface BroadcastPayload {
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
}

export default function EntranceCeremonyPage() {
    const [isJoined, setIsJoined] = useState(false);
    const [phase, setPhase] = useState<Phase>('WAITING');
    const [message, setMessage] = useState('式典開始までしばらくお待ちください');
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. 初期状態の取得 (DBから id: 1 を取得)
    useEffect(() => {
        const fetchCurrentStatus = async () => {
            const { data } = await supabaseClient
                .from('ceremony_state')
                .select('*')
                .eq("id", 1)
                .single();
            
            if (data) {
                setPhase(data.current_phase as Phase);
                setMessage(data.message);
            }
        };
        fetchCurrentStatus();
    }, []);

    // 2. Realtime 購読 (カスタムフックを使用)
    useCeremonyBroadcast('entrance', (payload: BroadcastPayload) => {
        if (!isJoined) return; // 入場前は処理しない
        handleRealtimeEvent(payload);
    });

    useEffect(() => {
        document.body.classList.add('ceremony');
        document.body.classList.add('tailwind-scope');
        return () => {
            document.body.classList.remove('ceremony');
            document.body.classList.remove('tailwind-scope');
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

        // 紙吹雪（桜色・ピンク系）
        if (payload.triggerConfetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFC0CB', '#FFB6C1', '#FFFFFF', '#FFD700']
            });
        }
    };

    // 入場ボタン
    const handleJoin = () => {
        setIsJoined(true);
        if (audioRef.current) {
            audioRef.current.play().catch(() => {}); // ブラウザの音声権限を有効化
        }
    };

    if (!isJoined) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
                <h1 className="mb-8 text-4xl font-serif tracking-widest text-pink-200">令和六年度 入社式</h1>
                <button
                    onClick={handleJoin}
                    className="rounded-full bg-pink-600 px-16 py-5 text-xl font-bold transition-all hover:bg-pink-500 hover:scale-105 active:scale-95 shadow-xl"
                >
                    式典会場に入場する
                </button>
                <p className="mt-6 text-sm text-slate-400">※音声をONにしてお進みください</p>
                <audio ref={audioRef} preload="auto" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${
            phase === 'SURPRISE' ? 'bg-pink-50' : 'bg-slate-50'
        }`}>
            <Head>
                <title>入社式 Live | {phase}</title>
            </Head>
            <audio ref={audioRef} preload="auto" />

            <main className="flex h-screen flex-col items-center justify-center p-4">
                <div className="absolute top-8 left-8 text-xs tracking-[0.3em] text-slate-400 uppercase font-mono">
                    Entrance Ceremony / {phase}
                </div>

                <div className="max-w-4xl text-center space-y-6">
                    <p className="text-xl text-pink-700 font-medium tracking-[0.2em] animate-pulse">
                        {phase === 'WAITING' ? 'Welcome to our Team' : 'Live Presentation'}
                    </p>
                    <h2 className="text-5xl md:text-8xl font-serif leading-tight text-slate-800 drop-shadow-sm">
                        {message}
                    </h2>
                </div>

                {phase === 'OPENING' && (
                    <div className="mt-16 h-[2px] w-32 bg-pink-300 animate-bounce" />
                )}
            </main>

            <style jsx global>{`
                body { margin: 0; font-family: "Hiragino Mincho ProN", serif; }
            `}</style>
        </div>
    );
}