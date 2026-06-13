import { StopStation, SomeStopStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = '#ff6000';
export default function OrangeLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                    <th>Rapid<br/>快速</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第一拠点<rt>だいいちきょてん</rt></ruby> OR01</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>和風横丁<rt>わふうよこちょう</rt></ruby> OR02</th>
                    <StopStation/>
                    <SomeStopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>花の森<rt>はなのもり</rt></ruby> OR03</th>
                    <StopStation/>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷南<rt>ちかけいこくみなみ</rt></ruby> OR04</th>
                    <StopStation/>
                    <td className="center" style={{ color: 'brown' }}>
                        <strong>茶色線へ</strong>
                    </td>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下渓谷北<rt>ちかけいこくきた</rt></ruby> OR05</th>
                    <StopStation/>
                    <td className="center"></td>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className="center" style={{ color: 'yellow' }}>
                        <strong>黄色線へ</strong>
                    </td>
                    <td className="center"></td>
                </tr>
            </tbody>
        </table>
    )
}