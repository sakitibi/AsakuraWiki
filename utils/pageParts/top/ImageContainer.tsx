import { useEffect, useState } from "react";

interface ImageContainerProps {
    freeze?: boolean;
}

export default function ImageContainer({ freeze }: ImageContainerProps) {
    const exists = typeof window !== "undefined" && !!document.getElementById("images-container");
    if (exists) {
        return null;
    }

    const images: string[] = [];
    for (let i = 1; i <= 5; i++) {
        images.push(`https://sakitibi.github.io/AsakuraWiki-Images/title/${i}.png`);
    }

    const [randomImage, setRandomImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (!randomImage) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImage(images[randomIndex]);
        }

        if (freeze) {
            setOpacity(1);
            return;
        }

        const fadeInTimer = setTimeout(() => {
            setOpacity(1);
        }, 100);

        return () => clearTimeout(fadeInTimer);
    }, [freeze, randomImage]);

    useEffect(() => {
        if (freeze) return;

        const fadeOutTimer = setTimeout(() => {
            setOpacity(0);
        }, 4500);

        return () => clearTimeout(fadeOutTimer);
    }, [freeze, randomImage]);

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
                pointerEvents: freeze ? 'auto' : 'none'
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
                onSelect={() => {return false}}
                onMouseDown={() => {return false}}
            />
        </div>
    );
}