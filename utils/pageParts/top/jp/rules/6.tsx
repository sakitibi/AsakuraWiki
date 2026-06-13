import CollapseItem from "@/components/elements/Collapse";

export default function RulesComponents6(){
    return(
        <>
            <h2>6. その他</h2>
            <ul>
                <CollapseItem title="運営が適切ではないと判断した内容" eventKey="rule6-1">
                    <p><b>運営が適切ではないと判断した内容は、利用を禁止しています。</b>これは、明確に規定されていない場合でも、
                    サービスの健全な運営を妨げる可能性がある行為やコンテンツが対象です。</p>
                    <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>
                    <b>明文化されていない場合でも、運営が不適切と判断した行為には、
                    事前に警告や対応が取られる場合がありますのでご理解ください。</b></p>
                </CollapseItem>
                <CollapseItem title="利用規約やルールを理解せずに利用する行為" eventKey="rule6-2">
                    <p><b>利用規約やルールを十分に理解せずに利用する行為は禁止されています。</b>サービスを正しく利用するためには、規約やルールの理解が必要です。
                    理解が難しい場合や同意できない場合は、サービスの利用を控えていただく必要があります。</p>
                </CollapseItem>
            </ul>
        </>
    )
}