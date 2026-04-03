import { blockedDomains } from "@/pages/_app";
import { setGlobalDispatcher, Agent } from "undici";

const BLOCKED = new Set(blockedDomains);

setGlobalDispatcher(
    new Agent({
        connect: (opts, cb) => {
            if (BLOCKED.has(opts.hostname)) {
                cb(new Error(`Blocked domain: ${opts.hostname}`), null);
                return;
            }

            // ✅ デフォルト挙動に委ねる
            cb(null, undefined as any);
        },
    })
);