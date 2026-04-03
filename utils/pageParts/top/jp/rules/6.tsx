export default function RulesComponents6(){
    return(
        <>
            <h2>6. その他</h2>
            <ul>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules6-1" aria-expanded="false">
                        運営が適切ではないと判断した内容 
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules6-1" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>運営が適切ではないと判断した内容は、利用を禁止しています。</b>これは、明確に規定されていない場合でも、
                        サービスの健全な運営を妨げる可能性がある行為やコンテンツが対象です。</p>
                        <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                        <b>明文化されていない場合でも、運営が不適切と判断した行為には、
                        事前に警告や対応が取られる場合がありますのでご理解ください。</b></p>
                    </div>
                </div>
                <li>
                    <a style={{ color:"inherit", textDecoration:"none" }} className="collapsed" href="#rules6-2" aria-expanded="false">
                        利用規約やルールを理解せずに利用する行為 
                        <i className="fa-duotone fa-regular fa-caret-down fa-fw"></i>
                    </a>
                </li>
                <div id="rules6-2" className="collapse">
                    <div className="alert alert-dark" role="alert">
                        <p><b>利用規約やルールを十分に理解せずに利用する行為は禁止されています。</b>サービスを正しく利用するためには、規約やルールの理解が必要です。
                        理解が難しい場合や同意できない場合は、サービスの利用を控えていただく必要があります。</p>
                    </div>
                </div>
            </ul>
        </>
    )
}