import { useEffect } from 'react';
import { supabaseBrowser } from 'lib/supabaseClientBrowser';

export default function DiscordLogin() {
    useEffect(() => {
        supabaseBrowser.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>Discordログイン中...</p>
        </main>
    );
}