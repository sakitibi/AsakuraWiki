import { supabaseClient } from '@/lib/supabaseClient';
import { useEffect, useRef } from 'react';

export const useCeremonyBroadcast = (onTrigger: (payload: any) => void) => {
    // 最新のコールバック関数を保持するためのRef
    const triggerRef = useRef(onTrigger);

    // 常に最新の onTrigger を Ref に入れる
    useEffect(() => {
        triggerRef.current = onTrigger;
    }, [onTrigger]);

    useEffect(() => {
        // チャンネルの購読を開始
        const channel = supabaseClient.channel('ceremony_room', {
            config: { 
                broadcast: { self: false },
                // 接続を安定させるための設定（必要に応じて）
                presence: { key: 'ceremony' }
            }
        });

        console.log('Connecting to Supabase Realtime...');

        channel
            .on('broadcast', { event: 'trigger' }, ({ payload }) => {
                console.log('Broadcast received:', payload);
                // Ref経由で最新の関数を実行
                if (triggerRef.current) {
                    triggerRef.current(payload);
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Successfully subscribed to broadcast');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Channel subscription error');
                }
            });

        // アンマウント時にのみ解除
        return () => {
            console.log('Cleaning up channel...');
            supabaseClient.removeChannel(channel);
        };
    }, []); // 依存配列を空にすることで、再接続の繰り返しを防ぐ
};