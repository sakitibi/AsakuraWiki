import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import styles from '@/css/wikis.min.module.css';

interface TimeTableRendererProps{
    hour: number
}

interface Taigasestugen_terminals_Train{
    type: string;
    time: string;
    weekday: boolean;
    holiday: boolean;
    bound_for: string
}

interface Taigasestugen_terminals{
    pillager: string[];
    yukinami: {
        for_pillager: Taigasestugen_terminals_Train[];
        for_hinanii: Taigasestugen_terminals_Train[];
    };
    hinanii_house: {
        for_yukinami: Taigasestugen_terminals_Train[];
        for_seisomura: Taigasestugen_terminals_Train[];
    };
    seisomura: Taigasestugen_terminals_Train[];
    minamitaisetsu: Taigasestugen_terminals_Train[];
}

export default function WikiPage() {
    // states
    const [timeTable, setTimeTable] = useState<Taigasestugen_terminals | null>(null);
    const [url, setUrl] = useState<URL | null>(null);
    const syoyou_time_yukinami_for_pillager:number[] = [
        0, 2, 5, 8, 11
    ];
    const stations:string[] = [
        "ピリジャーの前哨基地",
        "泰雪山東",
        "泰雪山西",
        "北雪波",
        "雪波",
        "砂利山",
        "鈊旦村",
        "ひなにいハウス",
        "双雪穴",
        "枷山",
        "正岨村",
        "南泰雪ヶ丘村北",
        "南泰雪ヶ丘村南",
        "南泰雪村"
    ]
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
        async function timeTableFetched(){
            try{
                const res = await fetch("/api/timetables/taigasetsugen");
                const data = await res.json();
                setTimeTable(data ?? null);
            } catch(e){
                console.error("Error: ", e);
            }
        }
        timeTableFetched();
    }, []);
    useEffect(() => {
        setUrl(new URL(window.location.href));
    }, []);
    function Yukinami_for_pillager_renderer({hour}: TimeTableRendererProps){
        const station = Number(url?.searchParams.get("station_number"));
        return(
            <>
                <dt className={styles.hour}>{hour < 10 ? `0${String(hour)}` : String(hour)}</dt>
                <dd className={styles.contents}>
                    <ul className={styles.operation_frame}>
                        {timeTable!.yukinami.for_pillager.map((data, index) => (
                            <>
                                <li
                                    className={`${styles.time_frame} ${data.type === "rapid" ? styles.rapid : styles.local}`}
                                    key={`04-${index}`}
                                >
                                    <span className={styles.time}>{data.time + syoyou_time_yukinami_for_pillager[5 - station]}</span>
                                    <span className={styles.bound_for}></span>
                                    <small>{!data.weekday ? "平日運休" : !data.holiday ? "休日運休" : ""}</small>
                                </li>
                            </>
                        ))}
                    </ul>
                </dd>
            </>
        );
    }
    return (
        <>
            <Head>
                <title>タイガ雪原鉄道時刻表</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            {timeTable !== null ? (
                                <>
                                    <div id="timetable_container">
                                        <h1>{stations[Number(url?.searchParams.get("station_number")) - 1]}</h1>
                                        <dl className={styles.timetables}>
                                            {url?.searchParams.get("updown") === "0" ? (
                                                <>
                                                    {Number(url.searchParams.get("station_number")) >= 2 && Number(url.searchParams.get("station_number")) <= 5 ? (
                                                        <>
                                                            <Yukinami_for_pillager_renderer hour={4}/>
                                                            <Yukinami_for_pillager_renderer hour={5}/>
                                                            <Yukinami_for_pillager_renderer hour={6}/>
                                                            <Yukinami_for_pillager_renderer hour={7}/>
                                                            <Yukinami_for_pillager_renderer hour={8}/>
                                                            <Yukinami_for_pillager_renderer hour={9}/>
                                                            <Yukinami_for_pillager_renderer hour={10}/>
                                                            <Yukinami_for_pillager_renderer hour={11}/>
                                                            <Yukinami_for_pillager_renderer hour={12}/>
                                                            <Yukinami_for_pillager_renderer hour={13}/>
                                                            <Yukinami_for_pillager_renderer hour={14}/>
                                                            <Yukinami_for_pillager_renderer hour={15}/>
                                                            <Yukinami_for_pillager_renderer hour={16}/>
                                                            <Yukinami_for_pillager_renderer hour={17}/>
                                                            <Yukinami_for_pillager_renderer hour={18}/>
                                                            <Yukinami_for_pillager_renderer hour={19}/>
                                                            <Yukinami_for_pillager_renderer hour={20}/>
                                                            <Yukinami_for_pillager_renderer hour={21}/>
                                                            <Yukinami_for_pillager_renderer hour={22}/>
                                                            <Yukinami_for_pillager_renderer hour={23}/>
                                                            <Yukinami_for_pillager_renderer hour={0}/>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {Number(url?.searchParams.get("station_number")) >= 1 && Number(url?.searchParams.get("station_number")) <= 4 ? (
                                                        <></>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </>
                                            )}
                                        </dl>
                                    </div>
                                </>
                            ) : ""}
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