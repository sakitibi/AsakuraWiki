'use client';

import { blockedIP } from "@/utils/user_list";
import { useEffect, useState } from "react";

export default function ImageContainer() {
    const shouldBlock = typeof window !== "undefined" && (() => {
        const existingEl = document.getElementById("images-container");
        if (!existingEl) return false;
        const currentOpacity = window.getComputedStyle(existingEl).opacity;
        return parseFloat(currentOpacity) > 0;
    })();

    if (shouldBlock) {
        return null;
    }

    const images: string[] = [];
    for (let i = 1; i <= 5; i++) {
        images.push(`https://sakitibi.github.io/AsakuraWiki-Images/title/${i}.png`);
    }

    const [blockedIP_list_found, setBlockedIP_list_found] = useState<RegExp | undefined>(undefined);
    const [randomImage, setRandomImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const fetchIP = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ipaddress`);
                const data = await res.json();
                const ip = data.ip;
                
                const found = blockedIP.find(v => ip.match(v));
                setBlockedIP_list_found(found);
            } catch (error) {
                console.error("Failed to fetch IP address:", error);
            }
        };

        fetchIP();
    }, []);

    useEffect(() => {
        if (!randomImage) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImage(images[randomIndex]);
        }

        if (blockedIP_list_found) {
            setOpacity(1);
            return;
        }

        // 通常時のフェードイン
        const fadeInTimer = setTimeout(() => {
            setOpacity(1);
        }, 100);

        return () => clearTimeout(fadeInTimer);
    }, [randomImage, blockedIP_list_found]);

    useEffect(() => {
        if (blockedIP_list_found) return;

        const fadeOutTimer = setTimeout(() => {
            setOpacity(0);
        }, 4500);

        return () => clearTimeout(fadeOutTimer);
    }, [blockedIP_list_found, randomImage]);

    if (!randomImage) return null;

    return (
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
                pointerEvents: 'auto'
            }}
        >
            <img 
                src={randomImage} 
                alt="background" 
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill'
                }}
                onSelect={() => false}
                onMouseDown={() => false}
            />
        </div>
    );
}