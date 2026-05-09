import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import { supabaseClient } from '@/lib/supabaseClient';
import { useCeremonyBroadcast } from '@/hooks/useCeremonyBroadcast';

// 型定義
type Phase = 'WAITING' | 'OPENING' | 'SPEECH' | 'SURPRISE' | 'KADODE' | 'CLOSING';

export default function RetirementPage() {
    const [isJoined, setIsJoined] = useState(false);
    const [phase, setPhase] = useState<Phase>('WAITING');
    const [message, setMessage] = useState('感謝の会 開始までお待ちください');
    
    useEffect(() => {
        document.body.classList.add('ceremony');
        document.body.classList.add('tailwind-scope')

        return () => {
            document.body.classList.remove('ceremony');
            document.body.classList.remove('tailwind-scope');
        };
    }, []);

    // 1. 初期状態の取得 (DBから) - ページ読み込み時に実行
    useEffect(() => {
        const fetchCurrentStatus = async () => {
            const { data } = await supabaseClient
                .from('ceremony_state')
                .select('*')
                .eq("id", 2)
                .single();
            
            if (data) {
                setPhase(data.current_phase as Phase);
                setMessage(data.message);
            }
        };
        fetchCurrentStatus();
    }, []);

    // 2. Realtime 購読 (カスタムフックを使用)
    useCeremonyBroadcast((payload) => {
        if (!isJoined) return; // 入場していない場合は無視

        if (payload.phase) setPhase(payload.phase);
        if (payload.message) setMessage(payload.message);

        // 音声再生
        const audioRef = document.getElementsByClassName("retirement_closing") as HTMLCollectionOf<HTMLAudioElement>;
        if (payload.soundFile && audioRef.length > 0) {
            for (let i = 0;i < audioRef.length; i++){
                audioRef[i].src = `https://sakitibi.github.io/static.asakurawiki.com/sounds/${payload.soundFile}`;
                audioRef[i].play().catch(e => console.log("Audio play blocked", e));
            }
        }

        // 退社式専用：金銀の紙吹雪で門出を祝う (サイドから噴射する豪華版)
        if (payload.triggerConfetti) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#FFD700', '#C0C0C0'] // Gold & Silver
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#FFD700', '#C0C0C0']
                });

                if (Date.now() < animationEnd) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    });

    // 入場処理
    const handleJoin = () => {
        setIsJoined(true);
        for (let i = 0; i < 30;i++) {
            const audioRef = document.createElement("audio");
            audioRef.classList.add("retirement_closing")
            document.body.appendChild(audioRef);
            if (audioRef) {
                audioRef.play().catch(() => {}); // 音声権限の有効化
            }
        }
    };

    // 3. 入場前の待機画面
    if (!isJoined) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white font-serif">
                <Head>
                    <title>退社式 会場入口</title>
                </Head>
                <div className="text-center border border-amber-900/50 p-12 bg-slate-900 shadow-2xl rounded-sm">
                    <h1 className="mb-2 text-3xl tracking-widest text-amber-200">退社式</h1>
                    <p className="mb-10 text-slate-400 text-sm italic">Farewell Ceremony Entrance</p>
                    
                    <button
                        onClick={handleJoin}
                        className="group relative inline-block px-12 py-4 font-bold text-white transition-all duration-300 active:scale-95 bg-transparent border-none cursor-pointer"
                    >
                        {/* 背景枠：ここに amber-500 を適用 */}
                        <span className="absolute inset-0 border border-amber-500 transform transition-transform group-hover:scale-105 bg-transparent"></span>
                        
                        {/* 文字部分：z-10 を追加して枠より上に、かつ背景を透明に */}
                        <span className="relative z-10 bg-transparent text-amber-200 group-hover:text-white transition-colors">
                            会場へ入場する
                        </span>
                    </button>
                    
                    <p className="mt-6 text-xs text-slate-500 uppercase tracking-tighter">※ 音声あり / リアルタイム更新</p>
                </div>
            </div>
        );
    }

    // 4. 式典本番の画面
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-serif overflow-hidden">
            <Head>
                <title>Farewell Ceremony | {phase}</title>
            </Head>
            {/* 背景の装飾的なグラデーション（退社式の重厚感） */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-50 pointer-events-none" />

            <main className="relative flex h-screen flex-col items-center justify-center p-6 text-center">
                {/* ステータス表示 */}
                <div className="absolute top-12 flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-amber-800"></span>
                    <span className="text-xs tracking-[0.3em] text-amber-600 uppercase">
                        Current Status : {phase}
                    </span>
                    <span className="h-[1px] w-8 bg-amber-800"></span>
                </div>

                {/* メインテロップ */}
                <div className="max-w-5xl">
                    <p className="text-amber-500/80 tracking-[0.5em] mb-8 text-sm md:text-base animate-pulse">
                        {phase === 'WAITING' ? 'THANK YOU FOR EVERYTHING' : 'BEST WISHES FOR YOUR FUTURE'}
                    </p>
                    <h2 className="text-4xl md:text-7xl leading-tight border-y border-amber-900/30 py-12 px-4 shadow-inner">
                        {message}
                    </h2>
                </div>

                {/* 装飾要素 */}
                <div className="absolute bottom-12 opacity-30">
                    <div className="text-[10px] tracking-[1em] text-slate-500 uppercase">Asakura Wiki Ceremony System</div>
                </div>
            </main>

            {/* グローバルスタイルの調整 */}
            <style jsx global>{`
                body {
                    margin: 0;
                    background-color: #020617; /* bg-slate-950 */
                    font-family: "Hiragino Mincho ProN", "MS Mincho", serif;
                }
                h2 {
                    text-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
                }
            `}</style>
        </div>
    );
}