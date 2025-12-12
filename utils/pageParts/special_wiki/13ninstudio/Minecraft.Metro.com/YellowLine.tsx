import { StopStation, PassingStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = 'yellow';
const OrangeLineColor = '#ff6000';
export default function YellowLine(){
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
                    <td className="center" style={{ color: 'lime' }} colSpan={2}>
                        <strong>水素線 または <span style={{ color: '#aceafc'}}>空港線へ</span></strong>
                    </td>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>スポンジ<ruby>名物<rt>めいぶつ</rt></ruby> YR09</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>北<rt>きた</rt></ruby>スポンジ<ruby>名物<rt>めいぶつ</rt></ruby> YR10</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>巨大渓谷<rt>きょだいけいこく</rt></ruby> YR11</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>赤展望台<rt>あかてんぼうだい</rt></ruby> YR12</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄大草<rt>ちかてつおおくさ</rt></ruby> YR13 <span style={{ color: OrangeLineColor }}>OR06</span></th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄東第二都市<rt>ちかてつひがしだいにとし</rt></ruby> YR14 <span style={{ color: OrangeLineColor }}>OR07</span></th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第二都市<rt>だいにとし</rt></ruby>エンドポータル<ruby>前<rt>まえ</rt></ruby> YR15 <span style={{ color: OrangeLineColor }}>OR08</span></th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>ピリジャーの<ruby>前哨基地<rt>ぜんしょうきち</rt></ruby> YR16</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className="center" style={{ color: 'brown' }} colSpan={2}>
                        <strong>タイガ雪原鉄道へ</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}