import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function GitHubLogin() {
    useEffect(() => {
        const Signin = async() => {
            await supabaseClient.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/login/inputs/`,
                },
            });
        }
        Signin();
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>GitHubログイン中...</p>
        </main>
    );
}