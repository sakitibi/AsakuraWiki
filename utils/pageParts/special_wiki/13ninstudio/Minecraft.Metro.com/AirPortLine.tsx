import { StopStation, PassingStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = '#aceafc';
export default function AirPortLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                    <th>Rapid<br/>快速</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>青紀市<rt>せいきし</rt></ruby> AP01</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>青紀平原<rt>せいきへいげん</rt></ruby> AP02</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>青紀湖北<rt>せいきこきた</rt></ruby> AP03</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>青紀湖南<rt>せいきこみなみ</rt></ruby> AP04</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄<rt>ちかてつ</rt></ruby>ヒカキンハウス AP05</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄<rt>ちかてつ</rt></ruby>ジャングル<ruby>口<rt>ぐち</rt></ruby> AP06</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄叢<rt>ちかてつくさむら</rt></ruby> AP07</th>
                    <StopStation/>
                    <PassingStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>あさクラ <ruby>花の森国際空港<rt>はなのもりこくさいくうこう</rt></ruby><br/><small>(<ruby>花森空港<rt>はなもりくうこう</rt></ruby>)</small> AP08</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>スポンジ<ruby>名物<rt>めいぶつ</rt></ruby> AP09</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className="center" style={{ color: 'yellow' }} colSpan={2}>
                        <strong>黄色線へ</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}