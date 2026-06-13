import { StopStation, PassingStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = 'brown';
export default function BrownLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                    <th>Rapid<br/>快速</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className="center" style={{ color: '#ff9000' }} colSpan={2}>
                        <strong>オレンジ線へ</strong>
                    </td>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>花の森<rt>はなのもり</rt></ruby> BR03</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>小桜<rt>こざくら</rt></ruby> BR04</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷西<rt>ちかけいこくにし</rt></ruby> BR05</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第二都市<rt>だいにとし</rt></ruby>ニュータウン<ruby>東<rt>ひがし</rt></ruby> BR06</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第二都市<rt>だいにとし</rt></ruby>ニュータウン<ruby>中央<rt>ちゅうおう</rt></ruby> BR07</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第二都市<rt>だいにとし</rt></ruby>ニュータウン<ruby>西<rt>にし</rt></ruby> BR08</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第二都市川<rt>だいにとしがわ</rt></ruby> BR09</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>ピリジャーの<ruby>前哨基地<rt>ぜんしょうきち</rt></ruby> BR10</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className="center" style={{ color: LineColor }} colSpan={2}>
                        <strong>タイガ雪原鉄道へ</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}