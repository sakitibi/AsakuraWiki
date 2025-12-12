import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function AboutAd() {
    const [menuStatus, setMenuStatus] = useState(false);
    useEffect(() => {
        if(typeof document !== "undefined"){
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    return (
        <>
            <Head>
                <meta charSet='UTF-8'/>
                <title>広告について</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/about/ad"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className="pEntry__header">
                            <h1>広告について</h1>
                        </header>
                        <div className="pEntry__content">
                            <p>無料レンタルWIKIサービス「あさクラWiki」は、広告主やスポンサーからの広告収入によって運営しています。<br/>そのため、ユーザーが作成するすべてのWikiに広告を表示します。</p>
                            <h2>広告についてよくあるご質問</h2>
                            <div className={styles.listGroup}>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#01">Wikiの管理人に収益が発生しますか？</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#02">広告を貼ることができますか？</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#03">どうして広告掲載に制限が付いているの？</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#04">特定のWikiやページで広告が多く表示されるのはどうしてですか？</a>
                                <a className={`${styles.listGroupItem} AdSupport__link`} href="#05">有料で広告表示を外すことは可能でしょうか？</a>
                            </div>
                            <h2 id="01">Wikiの管理人に収益が発生しますか？</h2>
                            <p>管理人に限らず、ご利用のユーザーに報酬等は一切発生しません。</p>
                            <h2 id="02">広告を貼ることができますか？</h2>
                            <p>できます。営利目的の広告(バナー広告、テキスト広告、アフィリエイト広告等)や勧誘、関連する内容は、<br/>内容が禁止されていない場合は貼ることができます、</p>
                            <h2 id="03">どうして広告掲載に制限が付いているの？</h2>
                            <p>当サービスは複数人が共同でWebサイトを構築していく利用法を想定しており、誰でも簡単にページの作成や修正、削除することが可能です。</p>
                            <p>広告を掲載できることにより、 広告を掲載した方のビジネス戦略を確保しています。<br/>また、コンテンツ品質の向上や安定してWikiを運営するために<br/>広告の掲載を一部制限しています。(5カ月以上安定して運営しています。)</p>
                            <h2 id="04">特定のWikiやページで広告が多く表示されるのはどうしてですか？</h2>
                            <p>当サービスでは、サーバーやネットワークのリソースを適切に管理し、<br/>すべてのユーザーが快適に利用できる環境を維持するための対策を行っています。そのため、<b>特に負荷の大きいページやWikiでは、運営コストを補うために広告の露出が高くなる</b>ことがあります。</p>
                            <p>これは、大量のデータ転送や処理負荷の高いコンテンツ（画像の多用、大量のデータ処理など）が含まれるページでは、<br/>サーバーの負担が大きくなり、通常よりもリソースを消費するためです。</p>
                            <p>サーバーやネットワークのリソースは有限です。円滑な運営のため、適正なご利用にご協力をお願いいたします。</p>
                            <h2 id="05">有料で広告表示を外すことは可能でしょうか？</h2>
                            <p>あさクラメンバーなどには広告を外すことはできます。</p>
                            <p>積極的にWikiに参加しているユーザーには、あさクラメンバーへの招待状が届く事があります。</p>
                            <p>なお、当サービスはアカウント制のため、ブラウザの Cookie や ローカルストレージ、セッションストレージ の読み書きが制限されている場合や、<br/>これらがリセットされた場合でも、その判別が難しくなることはありません。</p>
                        </div>
                        <div className={`${styles.panel} ${styles.panelSuccess}`} style={{ marginTop: '30px'}}>
                            <div className={styles.panelHeading}>
                                <i className="fa-solid fa-landmark fa-fw fa-lg"></i>
                                広告収益の社会貢献について
                            </div>
                            <div className={styles.panelBody}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ minWidth: '80px' }}>
                                        <img
                                            src="https://sakitibi.github.io/AsakuraWiki-Images/menbers/chaaaco.png"
                                            width="80px"
                                            height="80px"
                                            alt='sorry'
                                        />
                                    </div>
                                    <div style={{ minWidth: '200px' }}>
                                        <p>当サービスで得られた広告収益の一部は、名前は長い方が有利批判と<a href="/special_wiki/maitetsu_bkmt">マイ鉄ネット撲滅委員会</a>の費用として適切に使用しております。<br/>広告収益を通じて、皆さまのご利用が名前は長い方が有利&amp;マイ鉄ネット批判への貢献につながっていることをお伝えできれば幸いです。<br/></p>
                                        <p>今後も、皆さまの信頼に応えるサービス運営に尽力いたします。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}