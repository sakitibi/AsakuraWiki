export default function PushFetchComponents1(
    repo: string,
    branch: string,
    path: string,
    req_fetch_nonce: string
) {
    const headers = new Headers();
    const fullPath = `${process.env.REPO_BASE_URL}/${repo}/tree-save/${branch}/${path}`;
    headers.set("sec-ch-ua", '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"');
    headers.set("content-type", "multipart/form-data; boundary=----WebKitFormBoundaryAPJBpVtPj5fsUiFf");
    headers.set("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0");
    headers.set("origin", process.env.REPO_BASE_URL!);
    headers.set("sec-fetch-site", "same-origin");
    headers.set("x-fetch-nonce", req_fetch_nonce);
    headers.set("sec-fetch-mode", "cors");
    headers.set("github-verified-fetch", "true");
    headers.set("x-github-client-version", "0a9d22498b565412024c2cd95a0875a2f53510f1");
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