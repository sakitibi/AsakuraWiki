import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function FigmaLogin() {
    useEffect(() => {
        if(typeof window !== "undefined"){
            supabaseClient.auth.signInWithOAuth({
                provider: 'figma',
                options: {
                    redirectTo: `${window.location.origin}/login/inputs/`,
                },
            });
        }
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <p>Figmaログイン中...</p>
        </main>
    );
}