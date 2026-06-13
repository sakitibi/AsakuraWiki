import { StopStation, PassingStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = 'green';
export default function GreenLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                    <th>Rapid<br/>快速</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>あげる<ruby>川上流村<rt>がわじょうりゅうむら</rt></ruby> GR01</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>南<rt>みなみ</rt></ruby>サバンナ<ruby>川<rt>がわ</rt></ruby> GR02</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄<rt>ちかてつ</rt></ruby>ゾンビピグリントラップ GR03</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>南花の森<rt>みなみはなのもり</rt></ruby> GR04</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>小桜<rt>こざくら</rt></ruby> GR05</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷南<rt>ちかけいこくみなみ</rt></ruby> GR06</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷東<rt>ちかけいこくひがし</rt></ruby> GR07</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>巨大渓谷<rt>きょだいけいこく</rt></ruby> GR08</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>北<rt>きた</rt></ruby>スポンジ<ruby>名物<rt>めいぶつ</rt></ruby> GR09</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄湖瀬<rt>ちかてつこぜ</rt></ruby> GR10</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>南湖瀬森林<rt>みなみこぜしんりん</rt></ruby> GR11</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄叢<rt>ちかてつくさむら</rt></ruby> GR12</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄新<rt>ちかてつしん</rt></ruby>メサ<ruby>市<rt>し</rt></ruby> GR13</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>メサ<ruby>市<rt>し</rt></ruby> GR14</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>丸成<rt>まるせい</rt></ruby> GR15</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>メサ<ruby>湖<rt>こ</rt></ruby> GR16</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>砂漠市北<rt>さばくしきた</rt></ruby> GR17</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className='center' style={{ color: LineColor }} colSpan={2}>
                        <strong>本線へ</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}