import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DiscordLogin() {
    useEffect(() => {
        supabase.auth.signInWithOAuth({
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