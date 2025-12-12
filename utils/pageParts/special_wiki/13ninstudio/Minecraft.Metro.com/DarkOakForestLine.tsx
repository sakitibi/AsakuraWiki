import { StopStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = '#df00ff';
export default function DarkOakForestLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>ダークオーク<ruby>森林<rt>しんりん</rt></ruby> DF01</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>杣板<rt>そまいた</rt></ruby> DF02</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>栗材<rt>くりざい</rt></ruby> DF03</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>北<rt>きた</rt></ruby>スイカボチャ<ruby>畑<rt>ばたけ</rt></ruby> DF04</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>東<rt>ひがし</rt></ruby>スイカボチャ<ruby>畑<rt>ばたけ</rt></ruby> DF05</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>サバンナ<ruby>縦断起点<rt>じゅうだんきてん</rt></ruby> DF06</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}></th>
                    <td className='center' style={{ color: 'red' }}>
                        <strong>赤線へ</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}