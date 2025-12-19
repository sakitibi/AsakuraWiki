import { useEffect } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';

export default function BitbucketLogin() {
    useEffect(() => {
        if(typeof window !== "undefined"){
            supabaseServer.auth.signInWithOAuth({
                provider: 'bitbucket',
                options: {
                    redirectTo: `${window.location.origin}/login/inputs/`,
                },
            });
        }
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>BitBucketログイン中...</p>
        </main>
    );
}