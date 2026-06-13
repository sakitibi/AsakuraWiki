import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function DiscordLogin() {
    useEffect(() => {
        supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${window.location.origin}/login/inputs/`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>Discordログイン中...</p>
        </main>
    );
}