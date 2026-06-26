import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseClientServer';
import upack from '@/node_modules/upack.js/src/index';
import { decodeBase64Unicode } from '@/lib/base64';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    } else if(req.method === "POST"){
        const body = req.body;
        const decoded = JSON.parse(new TextDecoder().decode(
            await upack.SEncoder.decodeSEncode(
                decodeBase64Unicode(body),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            )!
        ));
        
        const { data, error } = await supabaseServer.auth.signInWithPassword({
            email: decoded.email,
            password: decoded.password
        });

        if (error) {
            return res.status(401).json({error: error.message});
        }

        const Actokenfiltered = data.session?.access_token;
        const Rftokenfiltered = data.session?.refresh_token;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const GITHUB_OWNER = "sakitibi"; 
        const GITHUB_REPO = "AsakuraWiki";
        try{
            // GitHubのAPIエンドポイントへPOSTリクエストを送信
            const githubResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.EXTERNAL_REPO_TOKEN}`,
                        'Accept': 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event_type: "send-outlook-mail",
                        client_payload: {
                            email: data.user?.email
                        }
                    }),
                    signal: controller.signal
                }
            );
            if (githubResponse.status === 204) {
                console.log("GitHub Actions の起動に成功しました。");
            } else {
                console.error("起動失敗:", githubResponse.status, await githubResponse.text());
            }
        } catch (error) {
            console.error("GitHub Actions の起動中に例外が発生しました:", error);
        } finally {
            clearTimeout(timeout);
        }
        return res.status(200).json({
            access_token: await upack.SEncoder.encodeSEncode(
                upack.encoder.encode(Actokenfiltered),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            ),
            refresh_token: await upack.SEncoder.encodeSEncode(
                upack.encoder.encode(Rftokenfiltered),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            )
        });
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}