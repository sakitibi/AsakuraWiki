export default function PushFetchComponents1(
    repo: string,
    branch: string,
    path: string,
    req_fetch_nonce: string,
    req_fetch_version: string
) {
    const headers = new Headers();
    const fullPath = `${process.env.REPO_BASE_URL}/${repo}/tree-save/${branch}/${path}`;
    headers.set("sec-ch-ua", '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"');
    headers.set("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0");
    headers.set("origin", process.env.REPO_BASE_URL!);
    headers.set("sec-fetch-site", "same-origin");
    headers.set("x-fetch-nonce", req_fetch_nonce);
    headers.set("sec-fetch-mode", "cors");
    headers.set("github-verified-fetch", "true");
    headers.set("x-github-client-version", req_fetch_version);
    headers.set("sec-ch-ua-platform", '"macOS"');
    headers.set("accept", "application/json");
    headers.set("x-requested-with", "XMLHttpRequest");
    headers.set("accept-encoding", "gzip, deflate, br, zstd");
    headers.set("sec-fetch-dest", "empty");
    headers.set("referer", fullPath);
    headers.set("sec-ch-ua-mobile", "?0");
    headers.set("accept-language", "ja");
    return headers;
}