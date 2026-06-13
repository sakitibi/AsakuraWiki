import { useEffect, useState } from "react";

interface ImageContainerProps{
    freeze?: boolean;
}

export default function ImageContainer({ freeze }: ImageContainerProps) {
    const images: string[] = [];
    for (let i = 1; i <= 5; i++) {
        images.push(`https://sakitibi.github.io/AsakuraWiki-Images/title/${i}.png`);
    }

    const [randomImage, setRandomImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        // freeze が true のときは、既に画像があっても強制的に不透明度を 1 に固定する
        if (freeze) {
            if (!randomImage) {
                const randomIndex = Math.floor(Math.random() * images.length);
                setRandomImage(images[randomIndex]);
            }
            setOpacity(1);
            return;
        }

        // freeze が false の場合の通常フェードイン処理
        if (!randomImage) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImage(images[randomIndex]);
        }

        const fadeInTimer = setTimeout(() => {
            setOpacity(1);
        }, 100);

        return () => clearTimeout(fadeInTimer);
    }, [freeze, randomImage]);

    useEffect(() => {
        if (freeze) return; // freeze のときはフェードアウトさせない

        const fadeOutTimer = setTimeout(() => {
            setOpacity(0);
        }, 4500);

        return () => clearTimeout(fadeOutTimer);
    }, [freeze, randomImage]); // randomImage が変わったときもタイマーをリセット

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
                    objectFit: 'fill',
                }}
                onSelect={() => {return false}}
                onMouseDown={() => {return false}}
            />
        </div>
    );
}