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
        try{
            if (!repo || !path) {
                return res.status(400).send("Error 400 Bad Request");
            }
            const reqbody = req.body;
            const response0 = await fetch(`${process.env.REPO_BASE_URL}/${repo}/edit/${branch}/${path}`);
            const data0 = await response0.text();
            const data0_release_indexof = data0.indexOf('<meta name="release" content="');
            const data0_nonce_indexof = data0.indexOf('<meta name="fetch-nonce" content="');
            const data0_commit_indexof = data0.indexOf('"currentOid":"');
            const req_fetch_release = data0.slice(data0_release_indexof + 30, data0_release_indexof + 70);
            const req_fetch_nonce = data0.slice(data0_nonce_indexof + 34, data0_nonce_indexof + 73);
            const data0_fetch_commit = data0.slice(data0_commit_indexof + 14, data0_commit_indexof + 54);
            console.log("nonce: ", req_fetch_nonce);
            const headers = PushFetchComponents1(
                repo,
                branch,
                path,
                req_fetch_nonce,
                req_fetch_release
            );
            const body = PushFetchComponents2(
                reqbody.message,
                reqbody.path,
                reqbody.new_path,
                data0_fetch_commit,
                Buffer.from(reqbody.bytes, 'base64')
            );
            console.log("headers: ", headers);
            console.log("body: ", body);
            const response = await fetch(`${process.env.REPO_BASE_URL}/${repo}/edit/${branch}/${path}`, {
                method: "POST",
                headers,
                body
            });
            const data = await response.text();
            const res_headers = Object(response.headers);
            return res.status(200).json({data, res_headers});
        } catch(e) {
            console.error("Error: ", e);
            return res.status(500).json({error: e});
        }
    }
}