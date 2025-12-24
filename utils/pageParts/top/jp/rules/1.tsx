export default function RulesComponents1(){
    return(
        <>
            <h2>1. 公的秩序・法律に関する内容</h2>
            <ul>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="data-bs-toggle collapsed" href="#rules1-1" aria-expanded="false">
                        公的秩序に反する内容
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules1-1" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p>
                            <b>公的秩序に反する内容は禁止されています。</b>これは、法律や社会的な秩序を乱す、またはそれを助長する行為や表現が対象です。<br/>具体的には、犯罪行為の促進、暴力的な行為やテロリズムの推奨、ヘイトスピーチ、違法な薬物や武器の取引に関する内容が含まれます。
                        </p>
                        <p style={{ margin:"15px" }}>
                            <i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                            <b>公序良俗に反する行為や表現は、法律に基づいて厳しく取り締まられる可能性があります。</b>
                        </p>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="data-bs-toggle collapsed" href="#rules1-2" aria-expanded="false">
                        著作権、財産、プライバシー等を侵害する内容
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules1-2" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p>他者の著作権、財産、肖像権、プライバシーを侵害しない範囲での利用が求められます。引用やコンテンツの利用は、法律の範囲内で適切に行ってください。</p>
                        <p style={{ margin:"15px" }}>
                            <i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                            <b>広く利用されている画像や情報であっても、無断で利用するとプライバシーや著作権、<br/>肖像権の侵害につながる可能性がありますので、取り扱いには十分な注意が必要です。</b>
                        </p>
                        <p><b>具体例:</b></p>
                        <ol>
                            <li>他人の記事や作品を無断でコピーする</li>
                            <b><i className="fa-solid fa-arrow-turn-down-right fa-fw"></i>著作権侵害の可能性</b>
                            <li>公開された住所や電話番号を無断で投稿する</li>
                            <b><i className="fa-solid fa-arrow-turn-down-right fa-fw"></i>プライバシー侵害の可能性</b>
                            <li>他人の写真や映像を無断で公開する</li>
                            <b><i className="fa-solid fa-arrow-turn-down-right fa-fw"></i>肖像権侵害の可能性</b>
                        </ol>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="data-bs-toggle collapsed" href="#rules1-3" aria-expanded="false">
                        第三者に危害や損害を与える内容(例外有り)
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules1-3" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p>
                            <b>第三者に対して危害や損害を与える可能性のある内容や行為は禁止されています。</b>具体的には、暴力、脅迫、詐欺、嫌がらせ、ハラスメントなど、<br/>他者に直接的または間接的に損害を与える行為が該当します。また、これらの行為を助長する内容も同様に禁止されています。
                        </p>
                        <p style={{ margin:"15px" }}>
                            <i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                            <b>他者の個人情報を無断で公開したり、暴力を助長する内容の投稿も厳しく禁止されます。<br/>行為によっては法的な措置が取られる可能性もあります。</b>
                        </p>
                        <p><b>具体例:</b></p>
                        <ol>
                            <li>「〇〇を傷つける」「〇日に□□を襲う」という脅迫的な発言</li>
                            <li>他人のSNSアカウントや個人情報を公開して、「みんなで凸しろ」または「荒らせ」と煽る行為</li>
                            <li>晒し上げ(例外有り,荒らしに対しては完全無効)（特定の個人、ハンドルネーム、または名前や個人情報を公開して批判や攻撃を誘導する行為）</li>
                        </ol>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="data-bs-toggle collapsed" href="#rules1-4" aria-expanded="false">
                        <strong style={{ color: "red" }}>ネットワークやシステムに過度な負荷をかける行為</strong>
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules1-4" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p>
                            <b>本サービスのネットワークやシステムに過度な負荷をかける行為は禁止です。</b>これには、大量のデータ送信、繰り返しのリクエスト、不正アクセス、バグや脆弱性の悪用が含まれます。<br/>さらに、大量リクエスト攻撃（DDoS攻撃など）や過剰リクエストツールの使用を誘導・実行する行為、およびそれを助長する行為も禁止されています。
                        </p>
                        <p style={{ margin:"15px" }}>
                            <i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                            <b>システムの安定性を損なう行為は厳禁です。これらの行為は、<br/>電子計算機損壊等業務妨害罪に該当し、法的措置が取られる可能性があります。</b>
                        </p>
                        <p>しかし、荒らしサイト(akidukisystems.com)などへの大量リクエスト攻撃（DDoS攻撃など）や過剰リクエストツールの使用を誘導・実行は義務となっています、</p>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="data-bs-toggle collapsed" href="#rules1-5" aria-expanded="false">
                        荒らし行為
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules1-5" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p>
                            <b>荒らし行為は禁止されています。</b>意図的に他の利用者に迷惑をかけたり、コミュニティの健全な運営を妨げる行為が対象です。<br/>スパム投稿や煽り、破壊的な編集、議論妨害などが該当します。
                        </p>
                        <p style={{ margin:"15px" }}>
                            <i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                            <b>荒らし行為は、精神的な負担を与えるだけでなく、<br/>場合によっては威力業務妨害罪や電子計算機損壊等業務妨害罪などの法的責任を問われる可能性があります。法律に基づき、これらの行為は厳しく取り締まられます。</b>
                        </p>
                        <p><b>具体例:</b></p>
                        <ol>
                            <li>無意味なページの大量作成</li>
                            <li>既存ページの破壊的編集（内容削除や無関係な書き込み）</li>
                            <li>スパムリンクの投稿や過度な外部リンクの追加</li>
                            <li>誤った情報を意図的に記載</li>
                            <li>他のユーザーを煽る行為や、荒らし行為に対して「荒らし返す」行為</li>
                            <li>荒らし目的の画像や不適切な画像を貼る行為</li>
                            <li>議論を妨害する行為（誤情報の流布や情報操作、議論を混乱させる発言）</li>
                        </ol>
                    </div>
                </div>
            </ul>
        </>
    )
}