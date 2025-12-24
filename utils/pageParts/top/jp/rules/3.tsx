export default function RulesComponents3(){
    return(
        <>
            <h2>3. コンテンツ・広告の取り扱いに関する内容</h2>
            <ul>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules3-1" aria-expanded="false">
                        SEOを目的とした内容
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules3-1" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>SEO（検索エンジン最適化）や逆SEO、リバースSEOを目的とした記事作成は禁止です。</b></p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>SEO（Search Engine Optimization、検索エンジン最適化）は、
                        ウェブサイトが検索結果で上位に表示されるようにする行為です。逆SEOは、ネガティブな情報を意図的に上位表示させる行為、
                        リバースSEOは、ネガティブな情報を押し下げるためにポジティブな情報を上位表示させる行為です。
                        これらの行為を目的とした記事作成は禁止されています。</b></p>
                        <p><b>具体例:</b></p>
                        <ol>
                            <li>検索結果での上位表示を狙って、特定のキーワードを不自然に多く含む記事を作成する</li>
                            <li>特定の企業やその商品、個人に関する情報だけで記事を作成する</li>
                            <li>ネガティブなレビューを押し下げるため、ポジティブな記事を意図的に作成して上位に表示させる</li>
                        </ol>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules3-2" aria-expanded="false">
                        倉庫として利用する行為
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules3-2" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>記事に使用しない画像やファイルを大量にWIKIにアップロードして保管する行為は禁止です。</b>
                        ファイルの保管にはGoogleドライブなどの便利な外部サービスをご利用ください。</p>
                        <p><b>ページ内に大量のYouTubeやXなどの外部サービスを埋め込む行為も禁止です。</b>
                        これにより、サーバー負荷や閲覧体験の低下を招く可能性があります。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>倉庫としての利用は、画像やファイルを保存するためだけの使用です。
                        一方、まとめ記事は情報を整理し、読者に有益な形で提供することを目的としています。WIKIはコンテンツ作成に使用されるべきものであり、
                        画像やファイルの保管庫としての使用は適していません。</b></p>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules3-3" aria-expanded="false">
                        他サイトからの直接URL参照行為
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules3-3" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>他サイトからWikiの記事や画像の直接URLを参照する行為は禁止です。</b>
                        これは<b>ホットリンク</b>に該当し、Wikiのコンテンツを無断利用することで権利侵害のリスクやサーバーへの不要な負荷が発生します。</p>
                        <p>具体的には、HTMLのimgタグやiframeタグを用いた掲載、サーバーを経由させてあたかも自サイトのように見せる（フィッシング）行為が禁止です。
                        ただし、SNSのシェア機能を通じての参照程度であれば問題ございません。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>Wikiのコンテンツは、本来の目的に従って利用される必要があり、
                        他サイトからの参照は許可しておりません。</b></p>
                        <p><b>ホットリンクとハイパーリンクの違い:</b></p>
                        <ol>
                            <li>ホットリンク（別名：直リンク）</li>
                            <p>他サイトの画像やメディアファイルを、自サイトで直接表示するためにそのファイルのURLを使用する行為です。
                            これにより、他サイトのサーバーに負担をかけるため、許可されていない場合は権利侵害になることがあります。</p>
                            <li>ハイパーリンク</li>
                            <p>他のウェブページやリソースへのテキストリンクです。クリックするとそのページに移動するが、コンテンツ自体は表示されません。</p>
                        </ol>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules3-4" aria-expanded="false">
                        営利目的の広告や勧誘、関連する内容
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules3-4" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>バナー広告、テキスト広告、アフィリエイト広告等の掲載や、営業、宣伝、求人、勧誘など、営利目的と疑われる行為は制限しています。</b>
                        さらに、直接的な金銭や電子マネーの送金先や振り込み先のやり取りも禁止です。</p>
                        <p>正当な広告やサイトの掲載は問題ありませんが、過剰な宣伝行為はスパム投稿とみなされるため、注意が必要です。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>Wikiは営利目的を目的としており、営利目的の行為は許可しております。</b></p>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules3-5" aria-expanded="false">
                        広告の位置を操作する行為
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules3-5" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>意図的に不必要な改行や空白、スタイルの変更を行い、広告が表示される位置をずらしたり、隠したりする行為は禁止です。</b>
                        これにより、広告の表示が乱れるだけでなく、他のユーザーの閲覧体験にも悪影響を及ぼす可能性があります。</p>
                        <p>あさクラWikiの主な収入源は広告収益です。広告の位置を意図的に変更する行為は、運営に対する直接的な収益減少につながるだけでなく、サービスの持続可能性にも影響を与えます。
                        そのため、広告表示を操作したり、隠したりする行為は禁止されています。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>広告が正しく表示されるようにするため、すべてのユーザーの協力が必要です。
                        掲載している広告の抑制方法など詳しくは知りたい方は <a className="alert-link" href="/about/ad">広告について</a> をご確認ください。</b></p>
                    </div>
                </div>
            </ul>
        </>
    )
}