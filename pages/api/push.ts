import PushFetchComponents1 from "@/components/fetches/push/1";
import PushFetchComponents2 from "@/components/fetches/push/2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, repo, branch, path');
    const headers = req.headers;
    const repo = headers["repo"] as string | undefined;
    const branch = (headers["branch"] || "main") as string;
    const path = headers["path"] as string | undefined;
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else if (req.method === "PUT") {
        if (!repo || !path) {
            return res.status(400).send("Error 400 Bad Request");
        }
        const reqbody = req.body;
        const response0 = await fetch(`${process.env.REPO_BASE_URL}/${repo}/edit/${branch}/${path}`);
        const data0 = await response0.text();
        const data0_indexof = data0.indexOf('<meta name="fetch-nonce" content="');
        const req_fetch_nonce = data0.slice(data0_indexof + 34, data0_indexof + 73);
        console.log("nonce: ", req_fetch_nonce);
        const headers = PushFetchComponents1(repo, branch, path, req_fetch_nonce);
        const body = PushFetchComponents2(
            reqbody.message,
            reqbody.path,
            reqbody.new_path,
            Uint8Array.fromBase64(reqbody.bytes)
        );
        const response = await fetch(`${process.env.REPO_BASE_URL}/${repo}/edit/${branch}/${path}`, {
            method: "POST",
            headers,
            body
        });
        const data = await response.json();
        return res.status(200).json(data);
    }
}