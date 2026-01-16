import Head from "next/head";
import Script from "next/script";
import { useState } from "react";

export default function BKMT_Front(){
    const [text, setText] = useState<HTMLDivElement | null>(null);
    const H3Styles = "display: block;font-size: 1.17em;margin-block: 1em;margin-inline: 0px;font-weight: bold;unicode-bidi: isolate;border-width: 1px 1px 1px 15px;border-style: solid;border-color: rgb(175, 217, 101);border-image: initial;background-color: transparent;color: rgb(0, 0, 0);margin: 0.2em 0px 0.5em;padding: 0.3em 0.3em 0.15em 0.5em;";
    // Appear系統
    const MaegakiAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <p>これは有志による活動であり、<a href="https://wikiwiki.jp">WIKIWIKI</a>運営は関係ございません。</p>
            <p>このWikiは申請しないと編集不可能です(<a href="/wiki/maitetsu_bkmt/sinsei">申請ここ(編集元ページのソースと編集内容書いてね)</a>)</p>
        `);
    }

    const OnegaiAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <p><strong><span style="font-size:16px">マイ鉄ネットは悪質です、ご注意下さい。</span></strong></p>
        `);
    }

    const OshiraseAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <div id="member-kanyu">
                <h3 style="${H3Styles}">メンバー加入申請について</h3>
                <p><span style="color: red;">メンバー加入申請時に、ご自身の会社名やお名前を入力しないでください。</span>荒らし行為の標的にされてしまう恐れがあります。</p>
                <p>(さきちびは自己責任です)</p>
                <p>加入申請時には、『「マイ鉄ネット撲滅委員会」としての活動時に使用したい名前』を入力してください。</p>
            </div>
            <div id="comment-form-trolls">
                <h3 style="${H3Styles}">コメントフォームの荒らし行為について</h3>
                <p>最近チャット改造等の荒らしが増えております。</p>
                <p>改造荒らしについては「#rtcomment」だとチャット改造がてきないので荒らしの対応が追いついていない方等はご参考下さい。</p>
            </div>
            <div id="tomorrow-trolls-taiou">
                <h3 style="${H3Styles}">今後の荒らし行為への対応について</h3>
                <p>管理者のご意向に沿い、<a href="https://youtube.com/@NMNGyuri" target="_blank">名前は長い方が有利</a>、<a href="https://wikiwiki.jp/maitestu-net/-s/d65c537f" target="_blank">熟成牛タン</a>などの荒らしには、厳正に対処します、場合によっては発信者開示請求、法的措置などを取る場合がございます</p>
            </div>
            <div id="copyright-trolls">
                <h3 style="${H3Styles}">著作権侵害について</h3>
                <p>著作権法第十条で挙げられたものには、例外なく全てに著作権が発生します。著作権をはじめとする知的財産権の侵害は、時には裁判などに発展することもあります。</p>
                <p>権利侵害を受けた方は、当委員会に直接お問い合わせください。解決が難しいと当委員会が判断した場合は、<a href="https://sakitibi-com9.webnode.jp/page/3" target="_blank">管理者への相談をお勧めします。</a></p>
                <p>(※送信防止措置の請求には、問い合わせフォームにて13ninアカウントが必要です。)</p>
            </div>
            <div id="about-terms">
                <h3 style="${H3Styles}">利用規約について</h3>
                <p>事情により当委員会の利用規約を設定することが可決されました、</p>
                <p><a href="https://sakitibi.github.io/selects/e3839ee382a4e98984e3838de38383e38388e692b2e6bb85e5a794e593a1e4bc9a">ここから同意して下さい</a></p>
            </div>
        `);
    }
    const MemberAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <ul>
                <li><a href="/wiki/13ninstudio/SakitibiRailway.com" target="_blank">さきちび</a></li>
                <li><a href="https://discord.gg/zbvXxCWcg6" target="_blank">匿名</a></li>
                <li><a href="https://youtube.com/@mizore471" target="_blank">みぞれ</a></li>
            </ul>
        `);
    }

    const JouhouAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <p><span style="color: tomato;">企画名</span></p>
            <p>マイ鉄ネット撲滅委員会</p>
        `);
    }

    const SyusaiAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <ul>
                <li><a href="/wiki/13ninstudio/SakitibiRailway.com" target="_blank">さきちび</a></li>
            </ul>
        `);
    }

    const KikakuNittei = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <p>2025-4-　 発足</p>
        `);
    }

    const detailsAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <p>さきちびが立てた計画。</p>
            <p>主に活動は消されたページや迷惑ページを直したり荒らしを撲滅します。</p>
            <p>RecentDeleted・RecentCreated・編集差分ログの監視もしています。</p>
            <p>最近では、あさクラ以外の荒らしにも手を付けております。</p>
        `);
    }

    const RenrakuRanAppear = () => {
        setText(document.getElementById("text") as HTMLDivElement);
        text!.innerHTML = (`
            <p>なにか直してほしいページや質問などがあれば、気軽にご質問ください。</p>
            <p><strong>過去の投稿は過去ログへ移動しました。</strong></p>
            <hr/>
            <div id="comment-form">
                <ul>
                    <li><a href="https://c.kuku.lu/d5rxyxs6" target="_blank">マイ鉄ネット撲滅委員会のチャットルーム開設</a> -- さきちび 2025-04-04 (金) 11:41:54</li>
                    <li>匿名を委員会メンバーに追加 -- さきちび 2025-04-13 (日) 11:35:01</li>
                    <li>メンバーになりたいです。現在は荒らし対策委員会にいます -- マグロのユッケ 2025-05-08 (木) 12:54:03</li>
                    <li><a href="https://sakitibi-com9.webnode.jp/page/9" target="_blank">13ninアカウントを作成し、あさクラメンバーになって下さい</a><br/>また、あなた様が<a href="/wiki/13ninstudio/要注意人物リスト" target="_blank">要注意人物リスト</a>に載って居る人物と<br/>関係が無いかチェックします -- さきちび 2025-05-09 (金) 12:40:11</li>
                    <li>あなた様はマイ鉄ネットで13ninアカウントにログインすることをお勧めします<br/>13ninアカウントでログインの下にあるはずです -- さきちび 2025-05-09 (金) 12:46:35</li>
                    <li>ログインしました。 -- マグロのユッケ 2025-05-28 (水) 20:15:51</li>
                    <li>上のコメントの人を2時間前に管理者コンタクトで通報しました<br/>通報メッセージは削除されました<br/>リクエストは完了したみたいです<br/>さきちび「対応しといたわ 23:08」 -- みぞれ 2025-05-28 (水) 23:14:03</li>
                    <li>対応しといたわ、みぞれさん、<br/>ご協力ありがとうございます。 -- さきちび 2025-05-28 (水) 23:20:18</li>
                    <li>この委員会のメンバーになりたいです<br/>あさクラメンバーだから行けますよね? -- みぞれ 2025-05-28 (水) 23:21:34</li>
                    <li>マイ鉄ネット撲滅委員会メンバー<br/>申請フォーム用意しとく -- さきちび 2025-05-28 (水) 23:26:24</li>
                    <li>みぞれ、承認 -- さきちび 2025-05-29 (木) 12:15:23</li>
                    <li>まずはマイ鉄ネットを本気で潰します<br/>まずは<a href="https://wikiwiki.jp/maitestu-net" target="_blank">FrontPage</a>を無くして.. -- みぞれ 2025-06-01 (日) 21:50:57</li>
                    <li>みぞれさん入れて正解かな<br/>マグロのユッケ入れたら止められそうこれ -- さきちび 2025-06-01 (日) 21:56:50</li>
                    <li><a href="https://wikiwiki.jp/maitestu-net/-s/dddc3dcc" target="_blank">これ</a>の<br/>Tipicaは、マイ鉄ネットの商標登録物です。<br/>は嘘だとおもいます。 -- みぞれ 2025-06-15 (日) 09:56:25</li>
                    <li>ご報告ありがとうございます!<br/>こちらで対応しておきます -- さきちび 2025-06-18 (水) 18:33:25</li>
                    <li><span style="font-size:15px;">自分主導で餅尾急行ワールドに軍事侵攻開始!</span> -- みぞれ 2025-06-24 (火) 23:49:15</li>
                    <li>早速<a href="https://www.youtube.com/@bedrockminecraftrailway" target="_blank">BMR</a>さんが<a href="https://wikiwiki.jp/vgtn" target="_blank">秋月</a>という荒らしの所にいたので<br/>早速注意喚起メール送りました -- さきちび 2025-06-25 (水) 17:33:45</li>
                    <li>今回の荒らしについて<br/>当委員会は仕事で活動している為<br/>今回の荒らし行為は<br/>威力業務妨害罪に<br/>問われる場合がございます、 -- みぞれ 2025-07-04 (金) 20:27:05</li>
                    <li>ページ長かったんでタブにしておきました! -- みぞれ 2025-07-07 (月) 17:51:53</li>
                    <li>7月24日に他Wikiに注意喚起貼りますか? -- さきちび 2025-07-08 (火) 16:48:13</li>
                    <li>みぞれさんと一緒にマイ鉄ネット撲滅委員会本部建設開始!<br/>完成予定日7月9日 -- さきちび 2025-07-08 (火) 19:06:49</li>
                    <li>他Wikiに注意喚起については3/3賛成で可決されました、 -- さきちび 2025-07-09 (水) 12:32:47</li>
                    <li>当委員会の活動費をクラウドファンディングで集めますか? -- みぞれ 2025-07-09 (水) 15:30:55</li>
                    <li>マイ鉄ネット撲滅委員会本部完成!(画像左右反転してる)<br/><img src="https://sakitibi.github.io/AsakuraWiki-Images/maitetsu_bkmt/fa1264ec-4008-4f0a-9056-ac62c0985f77.jpg" alt="マイ鉄ネット撲滅委員会本部" width="500" height="300"/><br/>-- さきちび 2025-07-09 (水) 16:36:47</li>
                    <li>クラウドファンディングはなお検討 -- さきちび 2025-07-10 (木) 18:47:33</li>
                    <li>依存関係が複雑すぎるのでクラウドファンディングは没<br/>広告とYoutubeで稼ぎましょう -- さきちび 2025-07-11 (金) 13:45:59</li>
                    <li>明日の作戦の成功基準は警告文ページに<br/>訪問人数25以上です -- みぞれ 2025-07-23 (水) 22:12:05</li>
                    <li>朗報です!、マイ鉄ネットワークを誰かが攻撃してくれました! -- みぞれ 2025-08-17 (日) 18:31:06</li>
                    <li>マイ鉄ネットワークの参加者がどんどん増えて来ちゃってる..<br/>これどうしよ -- みぞれ 2025-11-01 (土) 16:50:21</li>
                    <li><a href="https://wikiwiki.jp/p/information/view?id=8">これwikiwikiに警戒されてるんじゃ..</a> -- みぞれ 2025-12-08 (日) 12:21:53</li>
                    <li>やっぱ警戒されてそう -- さきちび 2025-12-15 (月) 17:56:32</li>
                    <li>正当な活動なのに荒らし判定されてますなぜか<br/><a href="https://wikiwiki.jp/maitestu-net/-s/2b12c755">敵対勢力</a>のコメント欄にて(1525airexp)さんの投稿<br/>場合によっては<a href="/wiki/13ninstudio/要注意人物リスト">要注意人物リスト</a>に入れる場合がございます、 -- さきちび 2026-01-10 (土) 16:54:34</li>
                    <li>ちなみに1525airexpさんの情報全てさきちびさんに開示請求した -- みぞれ 2026-01-16 (金) 15:57:23</li>
                </ul>
                <p><a href="/wiki/maitetsu_bkmt/comment" target="_blank">こちらでコメントする</a></p>
            </div>
        `);
    }

    const Disabled = () => {
        location.reload();
    }
    return (
        <>
            <Head>
                <title>マイ鉄ネット撲滅委員会</title>
                <link rel="shortcut icon"  href="https://pbs.twimg.com/profile_images/1564577297281085440/6q8goeNB.jpg"/>
            </Head>
            <div>
                <div style={{ padding: '2rem', maxWidth: 800 }}>
                    <div>
                        <main id='contents'>
                            <button onClick={MaegakiAppear}><span>まえがき</span></button>
                            <button onClick={OnegaiAppear}><span>おねがい</span></button>
                            <button onClick={OshiraseAppear}><span>お知らせ</span></button>
                            <button onClick={MemberAppear}><span>メンバー</span></button>
                            <button onClick={JouhouAppear}><span>情報</span></button>
                            <br/>
                            <button onClick={SyusaiAppear}><span>主催</span></button>
                            <button onClick={KikakuNittei}><span>企画日程</span></button>
                            <button onClick={detailsAppear}><span>詳細</span></button>
                            <button onClick={RenrakuRanAppear}><span>連絡欄</span></button>
                            <div id='text'></div>
                        </main>
                    </div>
                    <br />
                    <div>
                        <button onClick={Disabled} style={{cursor: 'not-allowed'}}><span>このページを編集</span></button>
                        <button onClick={Disabled} style={{cursor: 'not-allowed'}}><span>このページを削除</span></button>
                    </div>
                </div>
            </div>
            <Script src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js'/>
        </>
    )
}