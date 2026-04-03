export default function RulesComponents5(){
    return(
        <>
            <h2>5. 管理権限の不適切な扱い</h2>
            <ul>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules5-1" aria-expanded="false">
                        Wikiの管理を長期的に放置する行為
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules5-1" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>WIKIの管理を長期的に放置することは禁止されています。</b>WIKIは誰でも編集ができるため、管理が放置されると、セキュリティリスクや荒らし行為、
                        権利侵害の可能性が高まり、他の利用者にも影響を及ぼします。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>長期間の放置が確認された場合、管理権限の譲渡申請が可能となりますので注意が必要です。
                        迅速に対応できるよう、「管理者コンタクト」に連絡先を公開し、権利者や利用者からの問い合わせに備えてください。</b></p>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules5-2" aria-expanded="false">
                        管理権限が譲渡されたWIKIの私物化行為
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules5-2" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>譲渡された管理権限を用いてWikiを私物化する行為は禁止されています。</b>Wikiはコミュニティ全体のために存在しており、
                        特定の個人または法人が独占的に利用することは許されません。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>管理者は、他の利用者との協力を基にWikiの運営を行う責任があります。私的な目的でWikiを運営したり、
                        他の利用者のアクセスや投稿を不当に制限する行為は、管理権限の乱用にあたります。</b></p>
                        <p>私的な目的でWikiを運営するなら、Wiki設定からおすすめに表示するをオフにして下さい、</p>
                        <p><b>具体例:</b></p>
                        <ol>
                            <li>他の利用者や運営に相談せず、管理者がWikiの退会処理を行う行為</li>
                            <li>コミュニティや他の利用者と合意を得ずに、Wiki全体の構成や内容に大きな変更を加える行為</li>
                            <li>他のサービスへのWikiの移転を促す行為</li>
                            <p>Wikiを他のプラットフォームに移転することを提案したり、他サイトへの移行を誘導する行為は禁止されています。</p>
                            <li>Wikiを不正に占拠して荒らす行為</li>
                            <p>管理権限を不正に取得し、Wikiの内容を破壊したり、荒らす行為は禁止されています。他の利用者に迷惑をかけるだけでなく、コンテンツ全体の信頼性を損ないます。</p>
                        </ol>
                        <p><b>ご注意！</b></p>
                        <p><b>この「管理権限が譲渡されたWikiの私物化行為」は、「管理権限が譲渡されたWiki」に適用されるルールです。</b>
                            通常の管理者がそのまま運営しているWikiには、これがそのまま適用されるわけではありません。
                            このルールは、管理権限の譲渡後であっても、引き継いだ管理者が元の運営方針を尊重するべきであるという考え方に基づいています。</p>
                        <a style={{ margin:"3px" }} className="btn btn-dark btn-sm" href="/restore_guidelines">Wikiの復旧について
                            <i className="fa-solid fa-up-right-from-square fa-fw"></i>
                        </a>
                        <a style={{ margin:"3px" }} className="btn btn-dark btn-sm" href="/admin_change">管理権限譲渡のご案内
                            <i className="fa-solid fa-up-right-from-square fa-fw"></i>
                        </a>
                    </div>
                </div>
            </ul>
        </>
    )
}