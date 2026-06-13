import { useEffect, useState } from "react";

export default function ImageContainer() {
    const images: string[] = [];
    for (let i = 1; i <= 5; i++) {
        images.push(`https://sakitibi.github.io/AsakuraWiki-Images/title/${i}.png`);
    }

    const [randomImage, setRandomImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * images.length);
        setRandomImage(images[randomIndex]);

        const fadeInTimer = setTimeout(() => {
            setOpacity(1);
        }, 100); // レンダリング直後に実行するための僅かなディレイ

        const fadeOutTimer = setTimeout(() => {
            setOpacity(0);
        }, 4500);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
        };
    }, []);

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
                
                // アニメーションの要：ステートの変更に応じてopacityを変化させる
                opacity: opacity,
                // 1.5秒（1500ms）かけて滑らかに変化させる設定
                transition: 'opacity 1500ms ease-in-out'
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
            />
        </div>
    );
}