import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useRedirectRules() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const { pathname, search, hash } = window.location;

        if (pathname.startsWith("/special_wiki/13ninstudio")) {
            router.replace("/special_wiki/14ninstudio" + pathname.slice(25) + search + hash);
        }
        if (pathname.startsWith("/wiki/13ninstudio")) {
            router.replace("/wiki/14ninstudio" + pathname.slice(17) + search + hash);
        }
        if (pathname === '/index.askr') {
            router.replace('/' + search + hash);
            return;
        }
        if (pathname !== '/' && pathname !== '/.askr' && pathname.endsWith('.askr')) {
            router.replace(pathname.slice(0, -5) + search + hash);
        }
    }, [router]);
}