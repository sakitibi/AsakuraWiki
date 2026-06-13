import { supabaseClient } from '@/lib/supabaseClient';
import { useEffect, useRef } from 'react';

/**
 * 式典用リアルタイム通信フック
 * @param type 'entrance' | 'retirement' | 'birthday'
 * @param onTrigger メッセージ受信時のコールバック
 */
export const useCeremonyBroadcast = (
    type: 'entrance' | 'retirement' | 'birthday', 
    onTrigger: (payload: any) => void
) => {
    // 最新のコールバック関数を保持するためのRef（クロージャによる古い値の参照を防止）
    const triggerRef = useRef(onTrigger);

    // 常に最新の onTrigger を Ref に入れる
    useEffect(() => {
        triggerRef.current = onTrigger;
    }, [onTrigger]);

    useEffect(() => {
        // 管理画面の送信名に合わせてチャンネル名を動的に決定
        const channelName = `ceremony_room_${type}`;

        const channel = supabaseClient.channel(channelName, {
            config: { 
                broadcast: { self: false },
                presence: { key: type }
            }
        });

        console.log(`[Realtime] Connecting to ${channelName}...`);

        channel
            .on('broadcast', { event: 'trigger' }, ({ payload }) => {
                console.log(`[Realtime] Broadcast received from ${channelName}:`, payload);
                // Ref経由で常に最新の関数を実行
                if (triggerRef.current) {
                    triggerRef.current(payload);
                }
            })
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

        // アンマウント時にのみ解除
        return () => {
            console.log(`[Realtime] Cleaning up channel: ${channelName}`);
            supabaseClient.removeChannel(channel);
        };
    }, [type]); // typeが変更された場合のみ再接続
};