import { useEffect } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';

export default function GitLabLogin() {
    useEffect(() => {
        supabaseServer.auth.signInWithOAuth({
            provider: 'bitbucket',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>BitBucketログイン中...</p>
        </main>
    );
}