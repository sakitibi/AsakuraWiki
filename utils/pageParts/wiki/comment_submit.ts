// プレビュー or 閲覧コンテンツ
let commentSubmit: HTMLCollectionOf<Element> | null = null;
export default function CommentSubmitFunc(
    isEdit: boolean,
    wikiSlugStr: string,
    pageSlugStr: string
){
    const CommentSubmitInterval = setInterval(() => {
        if(typeof document.getElementsByClassName("comment-submit") === 'undefined'){
            if(typeof document.getElementsByClassName("comment-submit") !== 'undefined'){
                commentSubmit = document.getElementsByClassName("comment-submit");
            }

            if ((isEdit) && (location.pathname === `/wiki/${wikiSlugStr}` || pageSlugStr === "FrontPage")) {
                for(let i = 0; i < commentSubmit!.length; i++){
                    commentSubmit![i].setAttribute("disabled", "true");
                }
            }
        } else {
            const ClearInterval = setInterval(() => {
                clearInterval(CommentSubmitInterval);
                clearInterval(ClearInterval);
            }, 1000);
        }
    }, 1000);
}