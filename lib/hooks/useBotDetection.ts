import { useState, useEffect } from 'react';

export function useBotDetection() {
    const [isBot, setIsBot] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsBot(true);
            return;
        }

        const ua = navigator.userAgent;
        const bot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider|facebook\.com|HeadlessChrome)/i.test(ua);

        setIsBot(bot);
    }, []);

    return isBot;
}