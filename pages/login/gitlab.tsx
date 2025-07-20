import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function GitLabLogin() {
    useEffect(() => {
        supabase.auth.signInWithOAuth({
            provider: 'gitlab',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>GitLabログイン中...</p>
        </main>
    );
}