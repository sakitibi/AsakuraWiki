import MenuJp from "@/utils/pageParts/top/jp/Menu";
import HeaderJp from "@/utils/pageParts/top/jp/Header";
import FooterJp from "@/utils/pageParts/top/jp/Footer";
import LeftMenuJp from "@/utils/pageParts/top/jp/LeftMenu";
import RightMenuJp from "@/utils/pageParts/top/jp/RightMenu";
import { useEffect, useState } from "react";
import Head from "next/head";
import styles from '@/css/index.min.module.css';
import Script from "next/script";
import RulesComponents1 from "@/utils/pageParts/top/jp/rules/1";
import RulesComponents2 from "@/utils/pageParts/top/jp/rules/2";
import RulesComponents3 from "@/utils/pageParts/top/jp/rules/3";
import RulesComponents4 from "@/utils/pageParts/top/jp/rules/4";
import RulesComponents5 from "@/utils/pageParts/top/jp/rules/5";
import RulesComponents6 from "@/utils/pageParts/top/jp/rules/6";

export default function Rules(){
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
    useEffect(() => {
        if(!document) return;
        const el = document.getElementsByClassName("collapsed");
        for(let i = 0;i < el.length;i++){
            el[i].setAttribute("data-bs-toggle", "collapse");
        }
    }, []);
    return(
        <>
            <Head>
                <title>本サービスに関する利用のルール</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper} style={{ fontFamily: 'Noto Sans Japanese,sans-serif' }}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/rules" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className="pEntry__header">
                            <h1>本サービスに関する利用のルール</h1>
                        </header>
                        <p>このルールは、<a href="/policies">利用規約第6条（禁止事項） </a>の具体例を示しています。以下に記載されている行為は一例であり、 ここに含まれていない内容であっても、利用規約に反する行為は全て禁止されています。</p>
                        <p>ルールの中には内容が重複する場合もございますが、利用者の皆さまが安心してご利用いただけるよう、サービスの安全性と健全な運営を守るためにご協力をお願いいたします。</p>
                        <div className="pEntry__content">
                            <RulesComponents1/>
                            <RulesComponents2/>
                            <RulesComponents3/>
                            <RulesComponents4/>
                            <RulesComponents5/>
                            <RulesComponents6/>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
            <Script
                src="https://sakitibi.github.io/static.asakurawiki.com/js/app-342b4e71117d974a1648.min.static.js"
                defer
            />
        </>
    )
}