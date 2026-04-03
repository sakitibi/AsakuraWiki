import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function GitLabLogin() {
    useEffect(() => {
        supabaseClient.auth.signInWithOAuth({
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