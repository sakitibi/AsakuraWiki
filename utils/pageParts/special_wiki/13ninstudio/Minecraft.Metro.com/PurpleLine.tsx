import { StopStation, PassingStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = '#9f00ff';
export default function PurpleLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                    <th>Rapid<br/>快速</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>スイカボチャ<ruby>畑<rt>ばたけ</rt></ruby> PL01</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>赤展望台<rt>あかてんぼうだい</rt></ruby> PL02</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷東<rt>ちかけいこくひがし</rt></ruby> PL03</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷南<rt>ちかけいこくみなみ</rt></ruby> PL04</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>小桜<rt>こざくら</rt></ruby> PL05</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>トライアルチャンバー PL06</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>罘忇<rt>ふろく</rt></ruby> PL07</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>中央<rt>ちゅうおう</rt></ruby>ピリジャーの<ruby>前哨基地<rt>ぜんしょうきち</rt></ruby> PL08</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>北斗音<rt>きたとね</rt></ruby> PL09</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>斗音<rt>とね</rt></ruby> PL10</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>徘原<rt>はいはら</rt></ruby> PL11</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>サバンナ<ruby>村<rt>むら</rt></ruby> PL12</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>あげるハウス PL13</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className="center"></td>
                    <td className="center" style={{ color: '#99ed00' }}>
                        <strong>サバンナ縦断線へ</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}