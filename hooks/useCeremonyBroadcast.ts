import { supabaseClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export const useCeremonyBroadcast = (onTrigger: (payload: any) => void) => {
    useEffect(() => {
        // チャンネルの購読を開始
        const channel = supabaseClient.channel('ceremony_room', {
            config: { broadcast: { self: false } }
        });

        channel
        .on('broadcast', { event: 'trigger' }, ({ payload }) => {
            console.log('Broadcast received:', payload);
            onTrigger(payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to broadcast');
            }
        });

        // コンポーネントがアンマウントされたら購読を解除
        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [onTrigger]);
};