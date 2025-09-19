export function opendns(lang:string){
    const supportLink = document.createElement("a");
    supportLink.href = "/securitys/blocks/opendns";
    document.getElementById("menu-list")?.appendChild(supportLink);
    const button = document.createElement("button");
    supportLink.appendChild(button);
    const span = document.createElement("span");
    if(lang === "ja"){
        span.textContent = "詳細";
    } else if(lang === "ru"){
        span.textContent = "деталь";
    }
    button.appendChild(span);
}