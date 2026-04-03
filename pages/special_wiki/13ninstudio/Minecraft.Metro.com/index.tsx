import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import DarkOakForestLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/DarkOakForestLine';
import RedLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/RedLine';
import CyanLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/CyanLine';
import OrangeLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/OrangeLine';
import PurpleLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/PurpleLine';
import YellowLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/YellowLine';
import BrownLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/BrownLine';
import GreenLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/GreenLine';
import AirPortLine from '@/utils/pageParts/special_wiki/13ninstudio/Minecraft.Metro.com/AirPortLine';

export const StopStation = () => {
    return(
        <td className='center'>
            ⭕️
        </td>
    )
}

export const PassingStation = () => {
    return(
        <td className='center'></td>
    )
}

export const SomeStopStation = () => {
    return(
        <td className='center'>
            🔺
        </td>
    )
}

export default function WikiPage() {
    const router = useRouter()
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const cmdStr = typeof cmd === 'string' ? cmd : '';

    // クエリ→文字列化
        const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
        const pageSlugStr =
        typeof pageQuery === 'string'
            ? pageQuery
            : Array.isArray(pageSlug)
            ? pageSlug.join('/')
            : pageSlug ?? 'FrontPage';

    // state
    const [error]     = useState<string | null>(null)
    const [urlObj]   = useState<URL | null>(null)
    const [navfold, setNavfold] = useState<boolean[]>([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]);
    const designColor:"default" = "default";

    useEffect(() => {
        document.body.classList.add('wiki-font');
        document.body.classList.add('default');
        return () => {
            document.body.classList.remove('wiki-font');
            document.body.classList.remove('default');
        };
    }, [designColor]);

    useEffect(() => {
        if (cmdStr !== 'delete') return;
        if (!pageSlugStr || !wikiSlugStr) return;
    }, [cmdStr, pageSlugStr, wikiSlugStr]);

    // エラー or 読み込み中
    if (error)   return <div style={{ color: 'red' }}>{error}</div>

    const isEdit:boolean = urlObj?.searchParams.get('cmd') === 'edit'

    let commentSubmit:HTMLCollection | null = null;

    const CommentSubmitInterval = setInterval(() => {
        if(typeof document.getElementsByClassName("comment-submit") === 'undefined'){
            if(typeof document.getElementsByClassName("comment-submit") !== 'undefined'){
                commentSubmit = document.getElementsByClassName("comment-submit");
            }

            if ((isEdit) && (location.pathname === `/wiki/${wikiSlugStr}` || pageSlugStr === "FrontPage")) {
                for(let i = 0; i < commentSubmit!.length; i++){
                    commentSubmit![i].setAttribute("disabled", "true");
                }
            }
        } else {
            const ClearInterval:NodeJS.Timeout = setInterval(() => {
                clearInterval(CommentSubmitInterval);
                clearInterval(ClearInterval);
            }, 1000);
        }
    }, 1000);

    const NavFoldChanges = (index:number) => {
        setNavfold((prevFlags:boolean[]) =>
            prevFlags.map((flag, i) => (i === index ? !flag : flag))
        );
    }

    return (
        <>
            <Head>
                <title>マイクラメトロ</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}} className='MinecraftMetro'>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            <div id="title">
                                <h1 className='title'>マイクラメトロ</h1>
                            </div>
                            <div id="content">
                                <div className='center'>
                                    <span style={{ fontSize: '20px', color: 'yellow' }}>
                                        <strong>
                                            マイクラメトロをご利用下さいまして
                                            <br/>
                                            ありがとうございます。
                                        </strong>
                                    </span>
                                </div>
                                <div className='center'>
                                    <span style={{ fontSize: '15px', color: 'yellow' }}>
                                        ⬅︎東 西➡︎
                                    </span>
                                    <br/>
                                    <img src="https://sakitibi.github.io/AsakuraWiki-Images/Countries/12-29-1.png" alt="地図" />
                                </div>
                                <div className='center'>
                                    <span style={{ fontSize: '15px', color: 'yellow' }}>
                                        ⬅︎西 東➡︎
                                    </span>
                                    <br/>
                                    <img src="https://sakitibi.github.io/AsakuraWiki-Images/Countries/1-11-1.png" alt="あさクラ周辺マップ" />
                                </div>
                                {navfold.map((flag:boolean, index:number) => (
                                    <>
                                        <div key={index} className={flag ? 'navfold-container clearfix navfold-open' : 'navfold-container clearfix'}>
                                            <button className='navfold-summary' onClick={() => NavFoldChanges(index)}>
                                                <span className='navfold-summary-icon navfold-icon-close'>
                                                    <svg className="svg-inline--fa fa-chevron-right fa-fw fa-xs" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" data-fa-i2svg=""><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"></path></svg>
                                                </span>
                                                <span className='navfold-summary-icon navfold-icon-open'>
                                                    <svg className="svg-inline--fa fa-chevron-down fa-fw fa-xs" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path></svg>
                                                </span>
                                                <span className='navfold-summary-label' style={{
                                                    color: index === 0 ?
                                                    '#df00ff' : index === 1 ? 
                                                    'red' : index === 2 ? 
                                                    'cyan' : index === 3 ? 
                                                    '#ff6000' : index === 4 ? 
                                                    '#9f00ff' : index === 5 ? 
                                                    'yellow' : index === 6 ? 
                                                    'brown' : index === 7 ? 
                                                    'green' : '#aceafc'
                                                }}>
                                                    {index === 0 ? (
                                                        <>ダークオーク森林線 DF</>
                                                    ) : index === 1 ? (
                                                        <>赤線 RE</>
                                                    ) : index === 2 ? (
                                                        <>水色線 MZ</>
                                                    ) : index === 3 ? (
                                                        <>オレンジ線 OR</>
                                                    ) : index === 4 ? (
                                                        <>紫線 PL</>
                                                    ) : index === 5 ? (
                                                        <>黄色線 YR</>
                                                    ) : index === 6 ? (
                                                        <>茶色線 BR</>
                                                    ) : index === 7 ? (
                                                        <>緑線 GR</>
                                                    ) : (
                                                        <>空港線 AP</>
                                                    )}
                                                </span>
                                            </button>
                                            <div className='navfold-content'>
                                                <div className='h-scrollable'>
                                                    {index === 0 ? (
                                                        <DarkOakForestLine/>
                                                    ) : index === 1 ? (
                                                        <RedLine/>
                                                    ) : index === 2 ? (
                                                        <CyanLine/>
                                                    ) : index === 3 ? (
                                                        <OrangeLine/>
                                                    ) : index === 4 ? (
                                                        <PurpleLine/>
                                                    ) : index === 5 ? (
                                                        <YellowLine/>
                                                    ) : index === 6 ? (
                                                        <BrownLine/>
                                                    ) : index === 7 ? (
                                                        <GreenLine/>
                                                    ) : (
                                                        <AirPortLine/>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ))}
                                <div className="center">
                                    <p style={{ color: 'yellow' }}><a href="/wiki/13ninstudio/Minecraft.Metro.com/コメント">コメント欄はこちら</a></p>
                                </div>
                            </div>
                        </div>
                        <br/>
                        <div id="ad-container" style={{ textAlign: 'center' }}>
                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                        </div>
                    </article>
                    <Script
                        src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js'
                    />
                </div>
            </div>
        </>
    )
}