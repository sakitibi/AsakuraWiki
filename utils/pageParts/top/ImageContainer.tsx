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
    const [screenMode, setScreenMode] = useState<'image' | 'loading' | 'message' | 'final'>('loading');

    /* ===============================
        Bot 判定（state）
    =============================== */
    const [isBot, setIsBot] = useState(true);

    const audioUrl = "https://sakitibi.github.io/static.asakurawiki.com/sounds/antipiracy/Sandstorm.mp3";

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

    // 画面切り替えのタイマー処理
    useEffect(() => {
        if (blockedIP_list_found) {
            console.error("当サイトにアクセスする権限がありません。");

            // 1. フェードイン表示 (2秒後)
            const delayTimer = setTimeout(() => {
                setOpacity(1);
            }, 1000);

            const switchTimer = setTimeout(() => {
                setScreenMode('image');
            }, 32000);

            const messageTimer = setTimeout(() => {
                setScreenMode('message');
            }, 72000);

            const finalTimer = setTimeout(() => {
                setScreenMode('final');
            }, 102000);

            return () => {
                clearTimeout(delayTimer);
                clearTimeout(switchTimer);
                clearTimeout(messageTimer);
                clearTimeout(finalTimer);
            };
        }

        // 通常アクセス時
        if (!randomImage) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImage(images[randomIndex]);
        }

        const fadeInTimer = setTimeout(() => {
            setOpacity(1);
        }, 100);

        return () => clearTimeout(fadeInTimer);
    }, [randomImage, blockedIP_list_found]);

    // 音声再生
    useEffect(() => {
        if (blockedIP_list_found && (screenMode === 'image' || 'message' || screenMode === 'final')) {
            const audio = new Audio(audioUrl);
            audio.loop = true;

            audio.play().catch((error) => {
                console.warn("自動再生がブロックされました:", error);
            });

            return () => {
                audio.pause();
                audio.currentTime = 0;
            };
        }
    }, [blockedIP_list_found, screenMode]);

    // 通常時の自動フェードアウト
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
                    {blockedIP_list_found ? (
                        <>
                            {screenMode === 'image' && (
                                <div className="anti_piracy_conatiner">
                                    <h1 className="vibrate-text" style={{ fontSize: "300px", fontStyle: "italic" }}>
                                        {"\u0055\u0049\u0050"}
                                    </h1>
                                </div>
                            )}

                            {screenMode === 'message' && (
                                <div className="anti_piracy_conatiner">
                                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#565656' }}>
                                        ACCESS DENIED / UNAUTHORIZED USE DETECTED
                                    </h1>
                                    <p style={{ fontSize: '1.2rem', color: '#ffffff', lineHeight: '1.8' }}>
                                        当サイトへのアクセス権限がありません。<br />
                                        不正なアクセスまたは重大な利用規約への違反が確認されたため、閲覧をブロックしています。<br/>
                                        より悪質な場合は法的機関に通報します。
                                    </p>
                                    <p hidden>これは演出です</p>
                                </div>
                            )}

                            {screenMode === 'final' && (
                                <div className="anti_piracy_conatiner">
                                    <img 
                                        src=""
                                        alt="." 
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
                                </div>
                            )}
                        </>
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