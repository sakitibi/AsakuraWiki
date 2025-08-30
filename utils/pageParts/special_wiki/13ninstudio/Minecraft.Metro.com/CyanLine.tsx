import { StopStation } from "@/pages/special_wiki/13ninstudio/Minecraft.Metro.com";

const LineColor = 'cyan';
export default function CyanLine(){
    return(
        <table>
            <tbody>
                <tr>
                    <th>駅名/種別</th>
                    <th>Local<br/>普通</th>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>ダークオーク<ruby>森林<rt>しんりん</rt></ruby> MZ01</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>杣板<rt>そまいた</rt></ruby> MZ02</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>栗材<rt>くりざい</rt></ruby> MZ03</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>北<rt>きた</rt></ruby>スイカボチャ<ruby>畑<rt>ばたけ</rt></ruby> MZ04</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}>スイカボチャ<ruby>畑<rt>ばたけ</rt></ruby> MZ05</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>地下鉄共有倉庫<rt>ちかてつきょうゆうそうこ</rt></ruby> MZ06</th>
                    <StopStation/>
                </tr>
                <tr>
                    <th style={{ color:LineColor }}><ruby>第一拠点<rt>だいいちきょてん</rt></ruby> MZ07</th>
                    <StopStation/>
                </tr>
            </tbody>
        </table>
    )
}