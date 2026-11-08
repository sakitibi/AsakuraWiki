import { supabaseServer } from "@/lib/supabaseClientServer";
import type { NextApiRequest, NextApiResponse } from "next";
import { generateJWT, verifyJWT } from "@/pages/api/accounts/secretcode";

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-scaptcha-session');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    const scaptcha_params = req.headers["x-scaptcha-session"];
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else if (req.method === "GET") {
        if (!scaptcha_params) {
            return res.status(401).send("Error 401 Unauthorized");
        }

        const filtered_params = Array.isArray(scaptcha_params) ? scaptcha_params[0] : scaptcha_params;

        const decodedParams = await verifyJWT(filtered_params);

        if (!decodedParams.success) {
            return res.status(401).send("Error 401 The token has expired.");
        }

        const { data, error } = await supabaseServer
            .from("scaptcha_session")
            .select("*")
            .eq("data", decodedParams.JWTPayload)
            .single();
        if (error || !data) {
            if (error) {
                console.error("Error: ", error.message);
            }
            return res.status(404).send("Error 404 NotFound");
        }
        return res.status(200).json(data);
    } else if (req.method === "POST") {
        if (!req.body) {
            return res.status(401).send("Error 401 Unauthorized");
        }
        const body = { ...req.body };
        const redirect_url = body.redirecturl;
        const created_at = new Date();
        const Datenow = created_at.getTime();

        const { error } = await supabaseServer
            .from("scaptcha_session")
            .insert([{
                data: body.secretToken,
                created_at,
                ua: body.userAgent
            }])
            .single();
        
        const payload = { access_token: body, iat: Datenow, exp: Datenow + (1000 * 60 * 60) }
        const jwt = await generateJWT({alg: "RS256"}, payload, '1h');
        
        if (error) {
            console.error("Error: ", error.message);
            return res.status(500).send("Error 500 Internal Server Error");
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(
            `<html><head><title>Redirecting..</title>
            <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/index.globals.css"/>
            </head><body><script>
            localStorage.removeItem("scaptcha_params");
            localStorage.setItem("scaptcha_params", "${jwt}");
            location.replace("${redirect_url}");
            </script></body></html>`
        );
    } else if (req.method === "DELETE") {
        if (!scaptcha_params) {
            return res.status(401).send("Error 401 Unauthorized");
        }
        const { error } = await supabaseServer
            .from("scaptcha_session")
            .delete()
            .eq("data", scaptcha_params)
            .single();
        if (error) {
            return res.status(500).send("Error 500 Internal Server Error");
        }
        return res.status(204).end();
    } else {
        res.setHeader('Allow', ['GET','POST','DELETE','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}