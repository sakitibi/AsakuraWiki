'use client';

import { blockedIP } from "@/utils/user_list";
import { useEffect, useState } from "react";

interface ImageContainerProps {
    NotFound?: boolean;
}

export default function ImageContainer({ NotFound }: ImageContainerProps) {
    const [blockedIP_list_found, setBlockedIP_list_found] = useState<RegExp | undefined>(undefined);
    const [randomImage, setRandomImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(0);
    
    /* ===============================
        Bot 判定（state）
    =============================== */
    const [isBot, setIsBot] = useState(true);

    /* ===============================
        mount & UA 判定
    =============================== */
    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsBot(true);
            return;
        }

        const ua = navigator.userAgent;
        const bot =
            /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

        setIsBot(bot);
    }, []);

    const shouldBlock = typeof window !== "undefined" && !randomImage && (() => {
        const existingEl = document.getElementById("images-container");
        if (!existingEl) return false;
        const currentOpacity = window.getComputedStyle(existingEl).opacity;
        return parseFloat(currentOpacity) > 0;
    })();

    if (shouldBlock) {
        return null;
    }

    const images: string[] = [];
    for (let i = 1; i <= 10; i++) {
        images.push(`https://sakitibi.github.io/AsakuraWiki-Images/title/${i}.png`);
    }

    // IPアドレスの取得およびブロック判定
    useEffect(() => {
        const fetchIP = async () => {
            try {
                let ipBase = localStorage.getItem("ipaddress");
                if (!ipBase) {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ipaddress`);
                    const data = await res.json();
                    ipBase = data.ip;
                    localStorage.setItem("ipaddress", data.ip);
                }
                
                const found = blockedIP.find(v => ipBase?.match(v));
                setBlockedIP_list_found(found);
            } catch (error) {
                console.error("Failed to fetch IP address:", error);
            }
        };

        fetchIP();
    }, []);

    // 画像のセットおよびフェードイン処理
    useEffect(() => {
        // 1. ブロック対象IPが検出された場合の処理
        if (blockedIP_list_found) {
            console.error("当サイトにアクセスする権限がありません。");
            
            // 時間差でアンチ・パイラシー画面を表示
            const delayTimer = setTimeout(() => {
                setOpacity(1);
            }, 2000);

            return () => clearTimeout(delayTimer);
        }

        // 2. 通常アクセス時の処理
        if (!randomImage) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImage(images[randomIndex]);
        }

        const fadeInTimer = setTimeout(() => {
            setOpacity(1);
        }, 100);

        return () => clearTimeout(fadeInTimer);
    }, [randomImage, blockedIP_list_found]);

    // 通常時の自動フェードアウト（ブロック時は発動しない）
    useEffect(() => {
        if (blockedIP_list_found) return;

        const fadeOutTimer = setTimeout(() => {
            setOpacity(0);
        }, 4500);

        return () => clearTimeout(fadeOutTimer);
    }, [blockedIP_list_found, randomImage]);

    if (!randomImage && !blockedIP_list_found) return null;

    return (
        <>
            {isBot ? null : (
                <div 
                    id="images-container" 
                    style={{ 
                        position: 'fixed', 
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 99999,
                        overflow: 'hidden',
                        opacity: opacity,
                        transition: 'opacity 1500ms ease-in-out',
                        pointerEvents: opacity ? 'auto' : 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        backgroundColor: blockedIP_list_found ? '#000000' : 'transparent'
                    }}
                >
                    {/* ブロック時は専用の画面（または専用画像）、通常時はランダム画像を表示 */}
                    {blockedIP_list_found ? (
                        <div 
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#ff0000',
                                backgroundColor: '#000000',
                                textAlign: 'center',
                                fontFamily: 'sans-serif'
                            }}
                        >
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                                ACCESS DENIED / UNAUTHORIZED USE DETECTED
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                                当サイトへのアクセス権限がありません。<br />
                                不正な利用または規約違反の疑いがあるためアクセスを制限しています。
                            </p>
                        </div>
                    ) : (
                        <img 
                            src={randomImage || ''} 
                            alt="background" 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill',
                                pointerEvents: 'none', 
                                userSelect: 'none',
                                WebkitUserSelect: 'none'
                            }}
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    )}
                </div>
            )}
        </>
    );
}