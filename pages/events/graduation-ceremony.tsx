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
    const [message, setMessage] = useState('退社式 開始までお待ちください');
    
    // isJoinedの状態をRealtime通信内で正しく参照するためのRef
    const isJoinedRef = useRef(false);
    useEffect(() => {
        isJoinedRef.current = isJoined;
    }, [isJoined]);

    useEffect(() => {
        document.body.classList.add('ceremony');
        document.body.classList.add('tailwind-scope');

        return () => {
            document.body.classList.remove('ceremony');
            document.body.classList.remove('tailwind-scope');
        };
    }, []);

    // 1. 初期状態の取得
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

    // 2. Realtime 購読
    useCeremonyBroadcast((payload) => {
        // Refを使用して最新の入場状態をチェック
        if (!isJoinedRef.current) return; 

        if (payload.phase) setPhase(payload.phase);
        if (payload.message) setMessage(payload.message);

        // 音声再生
        const audioElements = document.getElementsByClassName("retirement_closing") as HTMLCollectionOf<HTMLAudioElement>;
        if (payload.soundFile && audioElements.length > 0) {
            for (let i = 0; i < audioElements.length; i++) {
                audioElements[i].src = `https://sakitibi.github.io/static.asakurawiki.com/sounds/${payload.soundFile}`;
                audioElements[i].play().catch(e => console.log("Audio play blocked", e));
            }
        }

        // 金銀の紙吹雪 (zIndexを追加して最前面へ)
        if (payload.triggerConfetti) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#FFD700', '#C0C0C0'],
                    zIndex: 9999 // これが重要
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#FFD700', '#C0C0C0'],
                    zIndex: 9999 // これが重要
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
        // 音声アンロック用に要素生成
        for (let i = 0; i < 30; i++) {
            const audio = document.createElement("audio");
            audio.classList.add("retirement_closing");
            audio.style.display = "none";
            document.body.appendChild(audio);
            audio.play().catch(() => {}); 
        }
    };

    // 3. 入場前の待機画面
    if (!isJoined) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white font-serif tailwind-scope">
                <Head>
                    <title>退社式 会場入口</title>
                </Head>
                <div className="text-center border border-amber-900/50 p-12 bg-slate-900 shadow-2xl rounded-sm">
                    <h1 className="mb-2 text-3xl tracking-widest text-amber-200">退社式</h1>
                    <p className="mb-10 text-slate-400 text-sm italic">Farewell Ceremony Entrance</p>
                    
                    <button
                        onClick={handleJoin}
                        className="group relative inline-block px-12 py-4 font-bold text-white transition-all duration-300 active:scale-95 bg-transparent border-none cursor-pointer outline-none"
                    >
                        <span className="absolute inset-0 border border-amber-500 transform transition-transform group-hover:scale-105 bg-transparent"></span>
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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-serif overflow-hidden tailwind-scope">
            <Head>
                <title>Graduation Ceremony | {phase}</title>
            </Head>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-50 pointer-events-none" />

            <main className="relative flex h-screen flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-12 flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-amber-800"></span>
                    <span className="text-xs tracking-[0.3em] text-amber-600 uppercase">
                        Current Status : {phase}
                    </span>
                    <span className="h-[1px] w-8 bg-amber-800"></span>
                </div>

                <div className="max-w-5xl">
                    <p className="text-amber-500/80 tracking-[0.5em] mb-8 text-sm md:text-base animate-pulse">
                        {phase === 'WAITING' ? 'THANK YOU FOR EVERYTHING' : 'BEST WISHES FOR YOUR FUTURE'}
                    </p>
                    <h2 className="text-4xl md:text-7xl leading-tight border-y border-amber-900/30 py-12 px-4 shadow-inner">
                        {message}
                    </h2>
                </div>

                <div className="absolute bottom-12 opacity-30">
                    <div className="text-[10px] tracking-[1em] text-slate-500 uppercase">Asakura Wiki Ceremony System</div>
                </div>
            </main>

            <style jsx global>{`
                body {
                    margin: 0;
                    background-color: #020617;
                    font-family: "Hiragino Mincho ProN", "MS Mincho", serif;
                }
                h2 {
                    text-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
                }
            `}</style>
        </div>
    );
}