import { useEffect } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';

export default function GitHubLogin() {
    useEffect(() => {
        supabaseServer.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/login/inputs/`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>GitHubログイン中...</p>
        </main>
    );
}