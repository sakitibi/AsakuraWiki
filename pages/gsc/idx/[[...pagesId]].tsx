import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { useRouter } from 'next/router';
import Link from 'next/link';

const TitleMaps = {
    "index": "無料 レンタル WIKI サービス あさクラWIKI",
    "about": "当レンタルWikiについて"
}
export default function GSCRedirect() {
    const [menuStatus, setMenuStatus] = useState(false);
    const router = useRouter();
    const { pagesId, page: pageQuery } = router.query;
    const [titles_list_found, setTitles_list_found] = useState<string>("リダイレクト");
    // クエリ→文字列化
    const pagesIdStr:string =
    typeof pageQuery === 'string'
        ? pageQuery
        : Array.isArray(pagesId)
        ? pagesId.join('/')
        : pagesId ?? 'index';
    useEffect(() => {
        if(!pagesIdStr) return;
        setTitles_list_found(
            (TitleMaps as any)[pagesIdStr] ?? "リダイレクト"
        );
    }, [pagesIdStr]);
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
                <title>{titles_list_found ?? "リダイレクト"}</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL={`/gsc/idx/${pagesIdStr}`} rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <Link href={`/${pagesIdStr}`}>
                            <button>
                                <span>リダイレクト</span>
                            </button>
                        </Link>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}