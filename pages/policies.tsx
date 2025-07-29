import MenuJp from "@/utils/pageParts/MenuJp";
import HeaderJp from "@/utils/pageParts/HeaderJp";
import FooterJp from "@/utils/pageParts/FooterJp";
import LeftMenuJp from "@/utils/pageParts/LeftMenuJp";
import RightMenuJp from "@/utils/pageParts/RightMenuJp";
import { useState } from "react";
import Head from "next/head";
import styles from 'css/index.min.module.css';

export default function Policies(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    return(
        <>
            <Head>
                <title>あさクラWiki利用規約</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/policies"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className={styles.pEntry__header}>
                            <h1 className={styles.h1}>利用規約</h1>
                        </header>
                        <p>本利用規約（以下「本規約」と言います。）には、本サービスの提供条件及び当社とユーザーの皆様との間の権利義務関係が定められています。本サービスの利用に際しては、本規約の全文をお読みいただいたうえで、本規約に同意いただく必要があります。</p>
                        <div className={styles.pEntry__content}>
                            <h2 className={styles.h2}>第1条（適用）</h2>
                            <ol className={styles.ol}>
                                <li>本規約は、本サービスの提供条件及び本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。</li>
                                <li>本規約の内容と、その他の本規約外における本サービスの説明等とが異なる場合は、本規約の規定が優先して適用されるものとします。(13nin利用規約引用)</li>
                            </ol>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}