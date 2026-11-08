import { useEffect } from 'react';
import { User } from '@supabase/auth-helpers-react';
import upack from 'upack';
import { importPrivateKey } from '@/lib/secureObfuscator';

const TermsAgreeIgnorePaths: string[] = [
    "/policies",
    "/privacy",
    "/rules",
    "/special_wiki/14ninstudio/amongus/rules"
];

export function useTermsAgreement(isBot: boolean, user: User | null, adminer_user_id_list: string | undefined, asPath: string) {
    useEffect(() => {
        if (typeof window === 'undefined' || !location || !localStorage || isBot) return;

        (async function () {
            const currentPath = location.pathname;

            if (adminer_user_id_list || TermsAgreeIgnorePaths.some(ignorePath => currentPath.startsWith(ignorePath))) {
                return;
            }

            const terms_agree = localStorage.getItem("terms_agree");

            if (!terms_agree) {
                location.replace(`/policies?redirect=${encodeURIComponent(currentPath)}${encodeURIComponent(location.search)}`);
                return;
            }

            try {
                const decoded = await upack.SEncoder.decodeSEncode(
                    terms_agree,
                    await importPrivateKey(process.env.NEXT_PUBLIC_UPACK_B64KEYPAIR?.split(",")[1]!),
                    0,
                    true
                );
                const termsAgreeTime = parseInt(decoded as string, 36);
                const expirePeriod = user ? 12096e5 : 6048e5;

                if (!termsAgreeTime || isNaN(termsAgreeTime) || (Date.now() - termsAgreeTime) > expirePeriod) {
                    localStorage.removeItem("terms_agree");
                    location.replace(`/policies?redirect=${encodeURIComponent(currentPath)}${encodeURIComponent(location.search)}`);
                }
            } catch (e) {
                console.error("terms_agree decode error:", e);
                localStorage.removeItem("terms_agree");
                location.replace(`/policies?redirect=${encodeURIComponent(currentPath)}${encodeURIComponent(location.search)}`);
            }
        })();
    }, [isBot, user, adminer_user_id_list, asPath]);
}