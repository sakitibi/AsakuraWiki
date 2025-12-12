type langProps = 
"ja" | "ru";

export function opendns(lang:langProps){
    if (typeof document === "undefined") return;
    const supportLink:HTMLAnchorElement = document.createElement("a");
    supportLink.href = "/securitys/blocks/opendns";
    document.getElementById("menu-list")?.appendChild(supportLink);
    const button:HTMLButtonElement = document.createElement("button");
    supportLink.appendChild(button);
    const span:HTMLSpanElement = document.createElement("span");
    if(lang === "ja"){
        span.textContent = "詳細";
    } else if(lang === "ru"){
        span.textContent = "деталь";
    }
    button.appendChild(span);
}