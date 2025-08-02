import { useEffect } from 'react';
import { supabaseServer } from 'lib/supabaseClientServer';

export default function DiscordLogin() {
    useEffect(() => {
        supabaseServer.auth.signInWithOAuth({
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