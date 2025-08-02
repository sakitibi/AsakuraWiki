import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClientBrowser';

export default function GitHubLogin() {
    useEffect(() => {
        supabaseBrowser.auth.signInWithOAuth({
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