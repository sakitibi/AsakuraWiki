import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import { supabaseClient } from '@/lib/supabaseClient';
import { useCeremonyBroadcast } from '@/hooks/useCeremonyBroadcast';
import { JSONProps } from '@/pages/api/staff_credits';

// 型定義
type Phase = 'WAITING' | 'OPENING' | 'CAKE_TIME' | 'PRESENT' | 'CLOSING' | 'SPEECH';

export interface BroadcastPayload {
    phase: Phase;
    message: string;
    soundFile?: string;
    triggerConfetti?: boolean;
}

export default function BirthdayCeremonyPage() {
    const [isJoined, setIsJoined] = useState(false);
    const [phase, setPhase] = useState<Phase>('WAITING');
    const [message, setMessage] = useState('主役の登場をお待ちください');
    const [birthdayUser, setBirthdayUser] = useState<JSONProps | null>(null);
    
    const isJoinedRef = useRef(false);

    useEffect(() => {
        isJoinedRef.current = isJoined;
    }, [isJoined]);

    // 1. 外部APIから本日の主役を取得
    useEffect(() => {
        const fetchBirthdayUser = async () => {
            try {
                const headers = new Headers();
                headers.set("Authorization", process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!);
                headers.set("x-data-type", "json");
                const res = await fetch('/api/staff_credits', {
                    headers
                });
                const data = await res.json();

                const today = new Date();
                const monthDay = `${today.getMonth() + 1}月${today.getDate()}日`;
                
                // 今日誕生日の人を特定
                const found = data.find((m:JSONProps) => m.birthday?.includes(monthDay)) || null;
                setBirthdayUser(found);
            } catch (e) {
                console.error("Failed to fetch birthday user", e);
            }
        };
        fetchBirthdayUser();
    }, []);

    // 2. DBから初期状態の取得 (誕生日式 ID: 3)
    useEffect(() => {
        const fetchCurrentStatus = async () => {
            const { data } = await supabaseClient
                .from('ceremony_state')
                .select('*')
                .eq("id", 3)
                .single();
            
            if (data) {
                setPhase(data.current_phase as Phase);
                setMessage(data.message);
            }
        };
        fetchCurrentStatus();
    }, []);

    // 3. Realtime 購読 (birthday チャンネル)
    useCeremonyBroadcast('birthday', (payload: BroadcastPayload) => {
        if (!isJoinedRef.current) return; 

        if (payload.phase) setPhase(payload.phase);
        if (payload.message) setMessage(payload.message);

        // 音声再生
        const audioRef = document.getElementsByClassName("birthday_closing") as HTMLCollectionOf<HTMLAudioElement>;
        if (payload.soundFile && audioRef.length > 0) {
            for (let i = 0;i < audioRef.length; i++){
                audioRef[i].src = `https://sakitibi.github.io/static.asakurawiki.com/sounds/${payload.soundFile}`;
                audioRef[i].play().catch(e => console.log("Audio play blocked", e));
            }
        }
        // カラフルな誕生日用・紙吹雪
        if (payload.triggerConfetti) {
            const end = Date.now() + (4 * 1000);
            const colors = ['#ff718d', '#fdff6a', '#4497f7', '#62ff62', '#ff9a00', '#ff00ff'];

            (function frame() {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.7 },
                    colors: colors,
                    zIndex: 9999
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.7 },
                    colors: colors,
                    zIndex: 9999
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    });

    useEffect(() => {
        document.body.classList.add('ceremony');
        document.body.classList.add('tailwind-scope');
        return () => {
            document.body.classList.remove('ceremony');
            document.body.classList.remove('tailwind-scope');
        };
    }, []);

    const handleJoin = () => {
        setIsJoined(true);
        for (let i = 0; i < 30;i++) {
            const audioRef = document.createElement("audio");
            audioRef.classList.add("birthday_closing")
            audioRef.style.display = "none";
            document.body.appendChild(audioRef);
            if (audioRef) {
                audioRef.play().catch(() => {}); // 音声権限の有効化
            }
        }
    };

    // 入場前の待機画面
    if (!isJoined) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-orange-50 text-orange-900 font-serif tailwind-scope">
                <Head>
                    <title>Birthday Party Entrance</title>
                </Head>
                <div className="text-center p-12 bg-white shadow-[0_20px_50px_rgba(251,146,60,0.2)] rounded-[3rem] border-4 border-orange-100">
                    <div className="text-6xl mb-6 animate-bounce">🎂</div>
                    <h1 className="mb-2 text-4xl font-black tracking-tighter text-orange-600">HAPPY BIRTHDAY</h1>
                    <p className="mb-10 text-orange-400 text-sm uppercase tracking-[0.3em]">Birthday Celebration Room</p>
                    
                    <button
                        onClick={handleJoin}
                        className="group relative inline-block px-16 py-5 font-bold text-white transition-all duration-300 active:scale-95 bg-orange-500 rounded-full hover:bg-orange-600 shadow-xl hover:shadow-orange-200"
                    >
                        会場でお祝いする
                    </button>
                    
                    <p className="mt-8 text-xs text-orange-300 font-sans tracking-widest">REALTIME INTERACTIVE SYSTEM</p>
                </div>
            </div>
        );
    }

    // 式典本番の画面
    return (
        <div className="min-h-screen bg-orange-50 text-orange-950 font-serif overflow-hidden tailwind-scope">
            <Head>
                <title>Birthday Live | {birthdayUser?.name}</title>
            </Head>
            
            {/* 背景装飾：ドットパターン */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{backgroundImage: 'radial-gradient(#fb923c 2px, transparent 2px)', backgroundSize: '40px 40px'}} />

            <main className="relative flex h-screen flex-col items-center justify-center p-6 text-center">
                {/* ヘッダー情報 */}
                <div className="absolute top-12 flex flex-col items-center gap-2">
                    <span className="text-[10px] tracking-[0.5em] text-orange-400 uppercase font-sans font-bold">
                        Special Celebration
                    </span>
                    <div className="h-[1px] w-12 bg-orange-200"></div>
                </div>

                <div className="max-w-5xl z-10">
                    {/* 主役の名前を表示するサブテロップ */}
                    <p className="text-orange-500 tracking-[0.4em] mb-8 text-lg md:text-xl font-bold animate-pulse">
                        {phase === 'WAITING' ? 'READY TO CELEBRATE' : `FOR OUR SPECIAL MEMBER: ${birthdayUser?.name}`}
                    </p>

                    {/* メインメッセージ：巨大な吹き出し風デザイン */}
                    <div className="relative inline-block">
                        <h2 className="text-4xl md:text-7xl leading-tight bg-white/80 backdrop-blur-md py-20 px-12 md:px-24 rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border-8 border-white">
                            {message}
                        </h2>
                        {/* デコレーション：キラキラ */}
                        <div className="absolute -top-6 -right-6 text-4xl">✨</div>
                        <div className="absolute -bottom-6 -left-6 text-4xl">✨</div>
                    </div>
                </div>

                {/* フッター装飾 */}
                <div className="absolute bottom-16 flex items-center gap-8 text-3xl opacity-40">
                    <span>🎉</span>
                    <span>🍰</span>
                    <span>🎁</span>
                </div>
            </main>

            <style jsx global>{`
                body {
                    margin: 0;
                    background-color: #fff7ed;
                    font-family: "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif;
                }
                h2 {
                    word-break: keep-all;
                    color: #431407;
                }
            `}</style>
        </div>
    );
}