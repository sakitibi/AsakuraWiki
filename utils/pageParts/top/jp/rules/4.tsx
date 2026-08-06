import CollapseItem from "@/components/elements/Collapse";

export default function RulesComponents4(){
    return(
        <>
            <h2>4. 特定のテーマに関する制限</h2>
            <ul>
                <CollapseItem title="性的な描写やわいせつな内容" eventKey="rule4-1">
                    <p><b>性的な描写やわいせつな内容は禁止です。</b>キャラクターや他者の体の部分を性的に扱う表現や、
                    性行為や性器に関する表現、またはそれを連想させる表現はすべて禁止です。
                    VTuberやゲームキャラクターなどの性的な台詞、スキル名、アイテム名の投稿、および性的な画像も含まれます。</p>
                    <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>性的な表現には、直接的な言葉だけでなく、
                    暗示的な表現や冗談も含まれます。記号で隠したりぼかした表現も禁止です。</b></p>
                    <p><b>具体例:</b></p>
                    <ol>
                        <li>キャラクターやVTuberの体の部分について話す内容</li>
                        <li>性的な冗談や比喩を含む内容</li>
                        <li>記号で隠した性的な表現</li>
                        <li>性行為や性器に関する表現、またはそれを連想させる発言</li>
                        <li>ゲーム内の性的なスキル名やアイテム名</li>
                        <li>架空のキャラクターやVTuberの性的な台詞や描写</li>
                        <li>性的な画像やイラストの投稿</li>
                    </ol>
                </CollapseItem>
                <CollapseItem title="宗教や信仰に関する内容" eventKey="rule4-2">
                    <p><b>宗教や信仰に関する内容は禁止されています。</b>宗教的なシンボルや儀式に関する表現が対象です。
                    ただし、明らかにフィクションと分かるゲーム内の宗教や儀式に関する内容は対象外です。</p>
                    <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i> <b>宗教的な表現が、特定の宗教や信仰を宣伝・侮辱・強制するもの、
                    または不適切に扱う内容は避けてください。フィクションに基づく内容についても、他者に不快感を与えないよう配慮する必要があります。</b></p>
                    <p><b>具体例:</b></p>
                    <ol>
                        <li>特定の宗教を宣伝したり布教を促す投稿</li>
                        <li>宗教的なシンボルや儀式に関する表現</li>
                        <li>記号で隠した性的な表現</li>
                        <li>宗教に関連する議論やコメント</li>
                    </ol>
                </CollapseItem>
                <CollapseItem title="60歳以上向けのコミュニティの運営や記事を作成する行為" eventKey="rule4-3">
                    <p><b>60歳以上を対象としたコミュニティの運営や、記事を作成する行為は禁止されています。これには、60歳以上の利用者をターゲットにしたコンテンツや、 彼らを意識した交流活動が含まれます。</b></p>
                    <p style={{ margin:"15px" }}><i className="fa-solid fa-message-exclamation fa-fw fa-lg fa-flip-horizontal"></i>当サービスでは、利用者の年齢制限は設けていませんが、<br/>
                    言動や投稿内容に基づき60歳以上を対象としていると判断した場合、<br/>
                    利用をお断りすることがあります。ハンドルネームのページを作成し、<br/>
                    それを通じた交流も対象となります。特定の年齢層をターゲットにした内容の投稿にはご注意ください。</p>
                    <p>なお、コミュニティの運営や記事を作成の対象年齢の下限はございません。59歳以下向けならどんなに低年齢層を対象にしても大丈夫です。</p>
                </CollapseItem>
            </ul>
        </>
    )
}