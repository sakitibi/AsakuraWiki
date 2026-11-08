import { useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';
import { gzip } from 'pako';
import { secureRandomString } from '@/lib/secureObfuscator';
import type { IPAddress } from '@/utils/pageParts/top/indexInterfaces';

export function useAnalyticsUploader(isBot: boolean, user: User | null) {
    const [ipaddress, setIpaddress] = useState<IPAddress | null>(null);

    // PVカウンター
    useEffect(() => {
        if (isBot) return;
        (async () => {
            try {
                await fetch('https://counter.wikiwiki.jp/c/14ninstudio/pv/_app', { cache: 'no-store' });
            } catch (e) {
                console.error('counter fetch error', e);
            }
        })();
    }, [isBot]);

    // IP取得
    useEffect(() => {
        if (isBot) return;
        (async () => {
            try {
                const res = await fetch('https://ipwho.is/?lang=ja');
                const data = (await res.json()) as IPAddress;
                setIpaddress(data);
            } catch (e) {
                console.error('ip fetch error', e);
            }
        })();
    }, [isBot]);

    // Supabaseへのアナリティクス送信
    useEffect(() => {
        if (!ipaddress || isBot) return;

        const upload = async () => {
            const compressed = gzip(JSON.stringify(ipaddress), { level: 9 });
            const bytea = '\\x' + Buffer.from(compressed).toString('hex');

            if (user) {
                await supabaseClient.from('analytics').upsert([
                    {
                        id: user.id,
                        data: bytea,
                        updated_at: new Date(),
                        ua: navigator.userAgent,
                        location_pathname: location.pathname
                    }
                ]);
            } else {
                let id = localStorage.getItem('unique_logouted_id');
                if (!id) {
                    id = secureRandomString(32);
                    localStorage.setItem('unique_logouted_id', id);
                }
                await supabaseClient.from('analytics_withlogouted').upsert([
                    {
                        id,
                        data: bytea,
                        updated_at: new Date(),
                        ua: navigator.userAgent,
                        location_pathname: location.pathname
                    }
                ]);
            }
        };

        upload();
    }, [ipaddress, user, isBot]);
}