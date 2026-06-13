import { StopStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = 'red';
export default function RedLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className='center' style={{ color: '#df00ff' }}>
                        <strong>ダークオーク森林線へ</strong>
                    </td>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>サバンナ<ruby>縦断起点<rt>じゅうだんきてん</rt></ruby> RE06</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>丁平<rt>ちょうひら</rt></ruby> RE07</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>趾比<rt>しひ</rt></ruby> RE08</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄<rt>ちかてつ</rt></ruby>ジャングル<ruby>口<rt>ぐち</rt></ruby> RE09</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄<rt>ちかてつ</rt></ruby>トレイル<ruby>遺跡<rt>いせき</rt></ruby> RE10</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄<rt>ちかてつ</rt></ruby>ヒカキンハウス RE11</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>西紫穴<rt>にししあな</rt></ruby> RE12</th>
                    <StopStation/>
                </tr>
            </tbody>
        </table>
    )
}