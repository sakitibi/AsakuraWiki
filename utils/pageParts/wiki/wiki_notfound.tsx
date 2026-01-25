import Head from "next/head";
import FooterJp from "@/utils/pageParts/top/jp/Footer";
import styles from "@/css/wikis.module.css";

export function WikiBanned(){
    return(
        <>
            <Head>
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.static.css"/>
                <title>404 Not Found</title>
            </Head>
            <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div className="article text-center">
                    <h1>404 Not Found</h1>
                    <div className={styles.noticeWikiRemoval} role='alert'>
                        <span className="noticeWikiRemoval__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                <path d="M96 256L96 96L544 96L544 256L640 256L640 304L544 304L544 512L352 512L192 608L192 512L96 512L96 304L0 304L0 256L96 256zM160 192L160 384L480 384L480 192L160 192zM256 256C273.7 256 288 270.3 288 288C288 305.7 273.7 320 256 320C238.3 320 224 305.7 224 288C224 270.3 238.3 256 256 256zM352 288C352 270.3 366.3 256 384 256C401.7 256 416 270.3 416 288C416 305.7 401.7 320 384 320C366.3 320 352 305.7 352 288z"></path>
                            </svg>
                        </span>
                        <span className="noticeWikiRemoval__text">
                            <strong>重要：</strong>
                            <b>お探しのコンテンツは当サービスの利用規約に違反したため削除されました。</b>
                        </span>
                    </div>
                    <div className={styles.noticeWikiRemovalRelated}>
                        <span className="noticeWikiRemoval__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                <path d="M544 96L96 96L96 544L544 544L544 96zM280 400L304 400L304 336L256 336L256 288L352 288L352 400L384 400L384 448L256 448L256 400L280 400zM352 192L352 256L288 256L288 192L352 192z"></path>
                            </svg>
                        </span>
                        <span className="noticeWikiRemoval__text">
                            関連ページ：
                            <a href="https://sakitibi-com9.webnode.jp/page/10" target='_blank'>13nin利用規約</a>
                            <a href="/policies" target='_blank'>あさクラWiki利用規約</a>
                        </span>
                    </div>
                    <svg className={styles.noticeWikiRemoval__overlayIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M496 608C416.5 608 352 543.5 352 464C352 384.5 416.5 320 496 320C575.5 320 640 384.5 640 464C640 543.5 575.5 608 496 608zM268.6 70.5C280.8 61.2 298.3 61.8 309.8 72.5L527.4 274.5C517.2 272.8 506.7 271.9 496.1 271.9C417.5 271.9 349.9 319.1 320.2 386.7C315.2 384.9 309.7 383.9 304.1 383.9L272.1 383.9C245.6 383.9 224.1 405.4 224.1 431.9L224.1 527.9L315 527.9C321.1 545.2 329.6 561.3 340.2 575.9L144 576C108.7 576 80 547.3 80 512L80 336L64 336C50.8 336 39 327.9 34.2 315.7C29.4 303.5 32.6 289.5 42.2 280.6L266.2 72.6L268.6 70.6zM555.3 404.7C549.1 398.5 538.9 398.5 532.7 404.7L496 441.4L459.3 404.7C453.1 398.5 442.9 398.5 436.7 404.7C430.5 410.9 430.5 421.1 436.7 427.3L473.4 464L436.7 500.7C430.5 506.9 430.5 517.1 436.7 523.3C442.9 529.5 453.1 529.5 459.3 523.3L496 486.6L532.7 523.3C538.9 529.5 549.1 529.5 555.3 523.3C561.5 517.1 561.5 506.9 555.3 500.7L518.6 464L555.3 427.3C561.5 421.1 561.5 410.9 555.3 404.7z"></path>
                    </svg>
                </div>
            </main>
            <FooterJp/>
        </>
    )
}

export function WikiDeleted(){
    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.static.css"/>
                <title>404 Not Found</title>
            </Head>
            <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div className="article text-center">
                    <h1>404 Not Found</h1>
                    <p>お探しのコンテンツはユーザー退会のため削除されました。</p>
                </div>
            </main>
            <FooterJp/>
        </>
    )
}