const BLOCKED = ["vercel.com"];

if (typeof window === "undefined") {
    const OriginalXHR = (global as any).XMLHttpRequest;

    if (OriginalXHR) {
        (global as any).XMLHttpRequest = class extends OriginalXHR {
            open(method: string, url: string) {
                if (BLOCKED.some(d => url.includes(d))) {
                throw new Error("Blocked XHR domain: " + url);
                }
                return super.open(method, url);
            }
        };
    }
}
