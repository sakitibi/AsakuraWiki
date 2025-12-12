let commentSubmit: HTMLCollectionOf<Element> | null = null;

export default function CommentSubmitFunc(
    isEdit: boolean,
    wikiSlugStr: string,
    pageSlugStr: string
){
    // サーバーサイドでは何もしない
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const CommentSubmitInterval = setInterval(() => {
        commentSubmit = document.getElementsByClassName("comment-submit");

        if ((isEdit) && (window.location.pathname === `/wiki/${wikiSlugStr}` || pageSlugStr === "FrontPage")) {
            for (let i = 0; i < commentSubmit.length; i++) {
                commentSubmit[i].setAttribute("disabled", "true");
            }
        }

        // 要素が見つかったらインターバルをクリア
        if (commentSubmit.length > 0) {
            clearInterval(CommentSubmitInterval);
        }
    }, 1000);
}
