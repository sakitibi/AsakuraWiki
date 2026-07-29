import { supabaseClient } from '@/lib/supabaseClient';
import { useEffect, useRef } from 'react';

export const useCeremonyBroadcast = (
    type: 'entrance' | 'retirement' | 'birthday',
    onTrigger: (event: string, payload: any) => void
) => {
    const triggerRef = useRef(onTrigger);

    useEffect(() => {
        triggerRef.current = onTrigger;
    }, [onTrigger]);

    useEffect(() => {
        const channelName = `ceremony_room_${type}`;

        const channel = supabaseClient.channel(channelName, {
            config: {
                broadcast: { self: false },
                presence: { key: type }
            }
        });

        console.log(`[Realtime] Connecting to ${channelName}...`);

        const receive = (event: string) => ({ payload }: { payload: any }) => {
            console.log(`[Realtime] ${event}`, payload);
            triggerRef.current?.(event, payload);
        };

        channel
            .on('broadcast', { event: 'trigger' }, receive('trigger'))
            .on('broadcast', { event: 'employee' }, receive('employee'))
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`✅ [Realtime] Successfully subscribed to ${channelName}`);
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error(`❌ [Realtime] Subscription error on ${channelName}`);
                }
                if (status === 'TIMED_OUT') {
                    console.warn(`⚠️ [Realtime] Connection timed out on ${channelName}`);
                }
            });

        return () => {
            console.log(`[Realtime] Cleaning up channel: ${channelName}`);
            supabaseClient.removeChannel(channel);
        };
    }, [type]);
};