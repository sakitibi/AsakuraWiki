import MenuJp from "@/utils/pageParts/MenuJp";
import HeaderJp from "@/utils/pageParts/HeaderJp";
import FooterJp from "@/utils/pageParts/FooterJp";
import LeftMenuJp from "@/utils/pageParts/LeftMenuJp";
import RightMenuJp from "@/utils/pageParts/RightMenuJp";
import { useState } from "react";
import Head from "next/head";
import styles from 'css/index.min.module.css';

export default function Policies(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    return(
        <>
            <Head>
                <title>あさクラWiki利用規約</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper} style={{ fontFamily: 'Noto Sans Japanese,sans-serif' }}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/policies"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className={styles.pEntry__header}>
                            <h1 className={styles.h1}>利用規約</h1>
                        </header>
                        <p>本利用規約（以下「本規約」と言います。）には、本サービスの提供条件及び当社とユーザーの皆様との間の権利義務関係が定められています。本サービスの利用に際しては、本規約の全文をお読みいただいたうえで、本規約に同意いただく必要があります。</p>
                        <div className={styles.pEntry__content}>
                            <h2 className={styles.h2}>第1条（適用）</h2>
                            <ol className={styles.ol}>
                                <li>本規約は、本サービスの提供条件及び本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。</li>
                                <li>本規約の内容と、その他の本規約外における本サービスの説明等とが異なる場合は、本規約の規定が優先して適用されるものとします。(13nin利用規約引用)</li>
                            </ol>
                            <h2 className={styles.h2}>第2条（定義）</h2>
                            <p>本規約において使用する以下の用語は、各々以下に定める意味を有するものとします。</p>
                            <ol className={styles.ol}>
                                <li>「サービス利用契約」とは、本規約及び当社とユーザーの間で締結する、本サービスの利用契約を意味します。</li>
                                <li>「知的財産権」とは、著作権、特許権、実用新案権、意匠権、商標権その他の知的財産権（それらの権利を取得し、またはそれらの権利につき登録等を出願する権利を含みます。）を意味します。</li>
                                <li>「投稿データ」とは、ユーザーが本サービスを利用して投稿その他送信するコンテンツ（文章、画像、動画その他のデータを含みますがこれらに限りません。）を意味します。</li>
                                <li>「当社」とは、<strong>株式会社<ruby>13ninstudio<rt>じゅうさんにんすたじお</rt></ruby></strong>を意味します。</li>
                                <li>「当社ウェブサイト」とは、そのドメインが「asakura-wiki.vercel.app, sakitibi.github.io, sakitibi-com9.webnode.jp, sakitibi-com8.webnode.jp, support-sakitibi-com9.webnode.jp」である、当社が運営するウェブサイト（理由の如何を問わず、当社のウェブサイトのドメインまたは内容が変更された場合は、当該変更後のウェブサイトを含みます。）を意味します。</li>
                                <li>「ユーザー」とは、登録ユーザー並びにゲストユーザーの総称です。</li>
                                <li>「登録ユーザー」とは、第3条（登録）に基づいて本サービスの利用者としての登録がなされた個人を意味します。</li>
                                <li>「ゲストユーザー」とは、閲覧などの、前項に定めるユーザー登録を行わずに利用できるサービスを利用する個人のことです。</li>
                                <li>「本サービス」とは、当社が提供するあさクラWikiという名称のサービス（理由の如何を問わずサービスの名称または内容が変更された場合は、当該変更後のサービスを含みます。）を意味します。</li>
                                <li>「<a href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>」とは、2025年2月16日 20:06:30 ごろに悪質な荒らし行為をした人物、その数ヶ月後にYoutubeの登録者を購入している人物を指します。</li>
                            </ol>
                            <h2 className={styles.h2}>第3条（登録）</h2>
                            <ol className={styles.ol}>
                                <li>本サービスの利用を希望する者（以下「登録希望者」といいます。）は、本規約を遵守することに同意し、かつ当社の定める一定の情報（以下「登録事項」といいます。）を当社の定める方法で当社に提供することにより、当社に対し、本サービスの利用の登録を申請することができます。</li>
                                <li>当社は、当社の基準に従って、第１項に基づいて登録申請を行った登録希望者（以下「登録申請者」といいます。）の登録の可否を判断し、当社が登録を認める場合にはその旨を登録申請者に通知します。登録申請者の登録ユーザーとしての登録は、当社が本項の通知を行ったことをもって完了したものとします。</li>
                                <li>前項に定める登録の完了時に、サービス利用契約が登録ユーザーと当社の間に成立し、登録ユーザーは本サービスを本規約に従い利用することができるようになります。</li>
                                <li>当社は、登録申請者が、以下の各号のいずれかの事由に該当する場合は、登録及び再登録を拒否することがあり、またその理由について一切開示義務を負いません。<br/>
                                    <ol>
                                        <li className={styles.li}>当社に提供した登録事項の全部または一部につき虚偽、誤記または記載漏れがあった場合</li>
                                        <li className={styles.li}>反社会的勢力等（暴力団、暴力団員、右翼団体、反社会的勢力、その他これに準ずる者を意味します。以下同じ。）である、または資金提供その他を通じて反社会的勢力等の維持、運営もしくは経営に協力もしくは関与する等反社会的勢力等との何らかの交流もしくは関与を行っていると当社が判断した場合</li>
                                        <li className={styles.li}>登録希望者が過去当社との契約に違反した者またはその関係者であると当社が判断した場合</li>
                                        <li className={styles.li}>第10条に定める措置を受けたことがある場合</li>
                                        <li className={styles.li}>名前は長い方が有利、すまない先生、秋月などの犯罪者、荒らしなどと関わっていると当社が判断した場合</li>
                                        <li className={styles.li}>その他、当社が登録を適当でないと判断した場合</li>
                                    </ol>
                                </li>
                            </ol>
                            <h2 className={styles.h2}>第4条（登録事項の変更）</h2>
                            <p>登録ユーザーは、登録事項に変更があった場合、当社の定める方法により当該変更事項を遅滞なく当社に通知するものとします。</p>
                            <h2 className={styles.h2}>第5条（パスワード及びユーザーIDの管理）</h2>
                            <ol className={styles.ol}>
                                <li className={styles.li}>登録ユーザーは、自己の責任において、本サービスに関するパスワード及びユーザーIDを適切に管理及び保管するものとします。</li>
                                <li className={styles.li}>パスワードまたはユーザーIDの管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任は登録ユーザーが負うものとし、当社は一切の責任を負いません。</li>
                            </ol>
                            <h2 className={styles.h2}>第6条（禁止事項）</h2>
                            <p>ユーザーは、本サービスの利用にあたり、以下の各号のいずれかに該当する行為または該当すると当社が判断する行為をしてはなりません。<br/>(赤文字のところは見かけたらすぐに当社に通報して下さい、該当場所を削除します、)</p>
                            <ol className={styles.ol}>
                                <li className={styles.li}>法令に違反する行為または犯罪行為に関連する行為</li>
                                <li className={styles.li}>当社、本サービスの他の利用者またはその他の第三者に対する詐欺または脅迫行為</li>
                                <li className={styles.li}>公序良俗に反する行為</li>
                                <li className={styles.li}>当社、本サービスの他の利用者またはその他の第三者の知的財産権、肖像権、プライバシーの権利、名誉、その他の権利または利益を侵害する行為(一部例外あり)</li>
                                <li className={styles.li}>
                                    本サービスを通じ、以下に該当し、または該当すると当社が判断する情報を当社または本サービスの他の利用者に送信すること
                                    <ol className={styles.ol}>
                                        <li className={styles.li}>過度に暴力的または残虐な表現を含む情報</li>
                                        <li className={styles.li}>コンピューター・ウィルスその他の有害なコンピューター・プログラムを含む情報</li>
                                        <li className={styles.li}>当社、本サービスの他の利用者またはその他の第三者の名誉または信用を毀損する表現を含む情報(一部例外あり,荒らしに対しては適応外)</li>
                                        <li className={styles.li}>過度にわいせつな表現を含む情報</li>
                                        <li className={styles.li}>差別を助長する表現を含む情報</li>
                                        <li className={styles.li}>自殺、自傷行為を助長する表現を含む情報</li>
                                        <li className={styles.li}>薬物の不適切な利用を助長する表現を含む情報</li>
                                        <li className={styles.li}>反社会的な表現を含む情報</li>
                                        <li className={styles.li}><strong>荒らしへの注意喚起などを除く</strong>全てのチェーンメール等の第三者への情報の拡散を求める情報</li>
                                        <li className={styles.li}>他人に不快感を与える表現を含む情報</li>
                                        <li className={styles.li}>面識のない異性との出会いを目的とした情報</li>
                                    </ol>
                                </li>
                                <li style={{ color: 'red' }} className={styles.li}>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                                <li style={{ color: 'red' }} className={styles.li}>本サービスの運営を妨害するおそれのある行為</li>
                                <li className={styles.li}>当社のネットワークまたはシステム等に不正にアクセスし、または不正なアクセスを試みる行為</li>
                                <li className={styles.li}>第三者に成りすます行為</li>
                                <li className={styles.li}>本サービスの他の利用者のIDまたはパスワードを利用する行為</li>
                                <li className={styles.li}>当社が事前に許諾しない本サービス上での宣伝、広告、勧誘、または営業行為(偽情報では無かったら基本OK)</li>
                                <li className={styles.li}>正当な理由が無い本サービスの他の利用者の情報の収集</li>
                                <li className={styles.li}>当社、本サービスの他の利用者またはその他の第三者に不利益、損害、不快感を与える行為(一部例外あり,荒らしに対しては適応外)</li>
                                <li className={styles.li}>当社ウェブサイト上で掲載する<a href="/rules">本サービスに関する利用のルール</a>に抵触する行為</li>
                                <li className={styles.li}>反社会的勢力等への利益供与</li>
                                <li className={styles.li}>面識のない異性との出会いを目的とした行為</li>
                                <li style={{ color: 'red' }} className={styles.li}>
                                    <strong>
                                        <a style={{ color: 'red' }} href="https://wikiwiki.jp/maitestu-net">マイ鉄ネットワーク</a>、
                                        <a style={{ color: 'red' }} href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>
                                        などの荒らしを擁護、支援、宣伝などをする行為
                                    </strong>
                                </li>
                                <li style={{ color: 'red' }} className={styles.li}><a style={{ color: 'red' }} href="https://sakitibi-com9.webnode.jp/page/10">13ninstudioの利用規約</a>に反する行為</li>
                                <li className={styles.li}>前各号の行為を直接または間接に惹起し、または容易にする行為</li>
                                <li className={styles.li}>その他、当社が不適切と判断する行為</li>
                            </ol>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}