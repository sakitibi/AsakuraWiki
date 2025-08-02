import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClientBrowser';

export default function GitLabLogin() {
    useEffect(() => {
        supabaseBrowser.auth.signInWithOAuth({
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