import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-filter');
    // Amongusのトークンを取得
    const res1 = await fetch("https://asakura-wiki.vercel.app/api/amongus/user");
    if (!res1.ok) {
        const errdata = await res1.text();
        return res.status(500).json({error: "token error", data: errdata});
    }
    const data1 = await res1.json();
    const auth_token = data1.token;
    const filter = req.headers["x-filter"] || '{"FilterSets":[{"GameMode":1,"Filters":[{"OptionType":"map","Key":"Map","SubFilterString":"{\\"AcceptedValues\\":54,\\"FilterType\\":\\"map\\"}"},{"OptionType":"int","Key":"ImpostorNumber","SubFilterString":"{\\"AcceptedValues\\":[3],\\"OptionEnum\\":1,\\"FilterType\\":\\"int\\"}"},{"OptionType":"bool","Key":"ConfirmEjects","SubFilterString":"{\\"AcceptedValues\\":[false],\\"OptionEnum\\":3,\\"FilterType\\":\\"bool\\"}"},{"OptionType":"bool","Key":"AnonymousVotes","SubFilterString":"{\\"AcceptedValues\\":[true],\\"OptionEnum\\":4,\\"FilterType\\":\\"bool\\"}"},{"OptionType":"chat","Key":"Chat","SubFilterString":"{\\"AcceptedValues\\":1,\\"FilterType\\":\\"chat\\"}"},{"OptionType":"languages","Key":"Language","SubFilterString":"{\\"AcceptedValues\\":512,\\"FilterType\\":\\"languages\\"}"}]}]}'

    // ヘッダーをセット
    const headers = new Headers();
    headers.set("accept-language", "ja")
    headers.set("accept", "application/json")
    headers.set("accept-encoding", "gzip, deflate, br")
    headers.set("priority", "u=3, i")
    headers.set("authorization", `Bearer ${auth_token}`)
    headers.set("baggage", "sentry-environment=production,sentry-public_key=7d060819d94d41f3ab7569154dccdcd5,sentry-release=Among%20Us%402026.4.7,sentry-trace_id=ce3704bfa2094130b35ece325432b31e")
    headers.set("sentry-trace", "ce3704bfa2094130b35ece325432b31e-2d2d6772e7314a51-0")
    headers.set("user-agent", "AmongUs/1 CFNetwork/3860.500.112 Darwin/25.4.0")
    headers.set("x-unity-version", "2022.3.44f1")
    const response = await fetch(
        `https://matchmaker-as.among.us:443/api/games/filtered?filter=${filter}`,
        {
            method: "GET",
            headers
        }
    );
    const data = await response.text();
    if (!response.ok) {
        return res.status(401).json({error: data, auth_token});
    }
    
    return res.status(200).json({token: data});
}
