import { kokuseiChousaStr } from "@/pages/news/2025/10/08/1";

export default function PoliciesNotting(){
    return(
        <>
            <p>ユーザーは、本サービスの利用にあたり、以下の各号のいずれかに該当する行為または該当すると当社が判断する行為をしてはなりません。<br/>(赤文字のところは見かけたらすぐに当社に通報して下さい、該当場所を削除します、)</p>
            <ol>
                <li>法令に違反する行為または犯罪行為に関連する行為</li>
                <li>当社、本サービスの他の利用者またはその他の第三者に対する詐欺または脅迫行為</li>
                <li>公序良俗に反する行為</li>
                <li>当社、本サービスの他の利用者またはその他の第三者の知的財産権、肖像権、プライバシーの権利、名誉、その他の権利または利益を侵害する行為(一部例外あり)</li>
                <li>
                    本サービスを通じ、以下に該当し、または該当すると当社が判断する情報を当社または本サービスの他の利用者に送信すること
                    <ol>
                        <li>過度に暴力的または残虐な表現を含む情報</li>
                        <li>コンピューター・ウィルスその他の有害なコンピューター・プログラムを含む情報</li>
                        <li>当社、本サービスの他の利用者またはその他の第三者の名誉または信用を毀損する表現を含む情報(一部例外あり,荒らしに対しては適応外)</li>
                        <li>過度にわいせつな表現を含む情報</li>
                        <li>差別を助長する表現を含む情報</li>
                        <li>自殺、自傷行為を助長する表現を含む情報</li>
                        <li>薬物の不適切な利用を助長する表現を含む情報</li>
                        <li>反社会的な表現を含む情報</li>
                        <li><strong>荒らしへの注意喚起などを除く</strong>全てのチェーンメール等の第三者への情報の拡散を求める情報</li>
                        <li>他人に不快感を与える表現を含む情報</li>
                        <li>面識のない異性との出会いを目的とした情報</li>
                    </ol>
                </li>
                <li className="danger_list">本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                <li className="danger_list">本サービスの運営を妨害するおそれのある行為</li>
                <li>当社のネットワークまたはシステム等に不正にアクセスし、または不正なアクセスを試みる行為</li>
                <li>第三者に成りすます行為</li>
                <li>本サービスの他の利用者のIDまたはパスワードを利用する行為</li>
                <li>当社が事前に許諾しない本サービス上での宣伝、広告、勧誘、または営業行為(偽情報では無かったら基本OK)</li>
                <li>正当な理由が無い本サービスの他の利用者の情報の収集</li>
                <li>当社、本サービスの他の利用者またはその他の第三者に不利益、損害、不快感を与える行為(一部例外あり,荒らしに対しては適応外)</li>
                <li>当社ウェブサイト上で掲載する<a href="/rules">本サービスに関する利用のルール</a>に抵触する行為</li>
                <li>反社会的勢力等への利益供与</li>
                <li>面識のない異性との出会いを目的とした行為</li>
                <li className="danger_list">
                    <strong>
                        <a href="https://wikiwiki.jp/maitestu-net">マイ鉄ネットワーク</a>、
                        <a href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>
                        などの荒らしを擁護、支援、宣伝などをする行為
                    </strong>
                </li>
                <li className="danger_list">
                    <strong>
                        <a href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>
                        の配信の合言葉を部屋内で発言する行為
                    </strong>
                </li>
                <li className="danger_list">
                    <strong>
                        <a href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>
                        の関係者が当サービスを利用する行為
                    </strong>
                </li>
                <li className="danger_list">
                    <strong>
                        <a href="https://www.e-kokusei.go.jp">{kokuseiChousaStr}</a>を支援、宣伝などをする行為
                    </strong>
                </li>
                <li className="danger_list">
                    <strong>
                        <a href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>の配信の概要欄を見る、または概要欄を勧める行為
                    </strong>
                </li>
                <li><a className="danger_list" href="https://sakitibi-com9.webnode.jp/page/10">13ninstudioの利用規約</a>に反する行為</li>
                <li>前各号の行為を直接または間接に惹起し、または容易にする行為</li>
                <li>その他、当社が不適切と判断する行為</li>
            </ol>
        </>
    )
}