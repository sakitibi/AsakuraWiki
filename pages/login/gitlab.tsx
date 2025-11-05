import { useEffect } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';

export default function GitLabLogin() {
    useEffect(() => {
        supabaseServer.auth.signInWithOAuth({
            provider: 'gitlab',
            options: {
                redirectTo: `${window.location.origin}/login/inputs/`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>GitLabログイン中...</p>
        </main>
    );
}