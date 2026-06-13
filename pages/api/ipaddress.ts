import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'node:dns/promises';
import { hash } from 'crypto';

function normalizeIp(ip: string | null): string | null {
    if (!ip) return null;

    if (ip === '::1') {
        return '127.0.0.1';
    }

    if (ip.startsWith('::ffff:')) {
        return ip.replace('::ffff:', '');
    }

    return ip;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const forwarded = req.headers['x-forwarded-for'];

    let ip: string | null = null;

    if (typeof forwarded === 'string') {
        ip = forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded)) {
        ip = forwarded[0];
    } else {
        ip = req.socket.remoteAddress ?? null;
    }

    ip = normalizeIp(ip);

    const hostsRaw = await dns.reverse(ip!);
    const hosts = hostsRaw[0];
    const networkId = hash("sha256", new TextEncoder().encode(hosts));

    return res.status(200).json({
        ip,
        hosts,
        networkId
    });
}