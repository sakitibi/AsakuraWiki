import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function BitbucketLogin() {
    useEffect(() => {
        if(typeof window !== "undefined"){
            supabaseClient.auth.signInWithOAuth({
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