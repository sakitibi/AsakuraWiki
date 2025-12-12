import { useEffect } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';

export default function GitHubLogin() {
    useEffect(() => {
        const Signin = async() => {
            await supabaseServer.auth.signInWithOAuth({
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