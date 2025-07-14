import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function GitHubLogin() {
    useEffect(() => {
        supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>GitHubログイン中...</p>
        </main>
    );
}