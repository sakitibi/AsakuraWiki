import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const yukinami_for_hinanii_house_fortable:string[] = [
        "minamitaisetsu", "iemon_house", "hinanii_house", "minamitaisetsu", "hinanii_house",
        "mangroverin", "hinanii_house", "seisomura", "hinanii_house", "hinanii_house",
        "seisomura", "hinanii_house", "hinanii_house", "hinanii_house", "hinanii_house",
        "hinanii_house", "hinanii_house", "hinanii_house", "seisomura", "hinanii_house"
    ];
    const hinanii_house_for_seisomura_typetable:string[] = [
        "local",  "local",  "local",  "rapid",  "local",  "rapid",  "local",  "rapid",  "local",  "rapid", 
        "rapid",  "local",  "rapid",  "rapid",  "rapid",  "rapid",  "rapid",  "rapid",  "rapid",  "local", 
    ];
    const seisomura_for_hinanii_house_typetable:string[] = [
        "rapid",  "rapid",  "local",  "rapid",  "local",  "rapid",  "local",  "rapid",  "local",  "rapid", 
        "rapid",  "local",  "local",  "rapid",  "local",  "local",  "rapid",  "rapid",  "local",  "local", 
    ];
    const hinanii_house_for_seisomura_fortable:string[] = [
        "mangroverin", "minamitaisetsu", "iemon_house", "mangroverin", "minamitaisetsu", "seisomura",
        "mangroverin", "minamitaisetsu", "seisomura", "mangroverin", "minamitaisetsu", "seisomura",
        "mangroverin", "minamitaisetsu", "iemon_house", "minamitaisetsu", "iemon_house", "mangroverin",
        "minamitaisetsu", "seisomura",
    ];
    const seisomura_for_hinanii_house_fortable:string[] = [
        "suikabocha_batake", "suikabocha_batake", "yukinami", "suikabocha_batake", "yukinami", "suikabocha_batake",
        "yukinami", "suikabocha_batake", "yukinami", "suikabocha_batake", "suikabocha_batake", "yukinami",
        "yukinami", "suikabocha_batake", "yukinami", "yukinami", "suikabocha_batake", "suikabocha_batake",
        "yukinami", "hinanii_house",
    ];
    let pillager_for_yukinami = [];
    let yukinami_for_pillager = [];
    let yukinami_for_hinanii_house = [];
    let hinanii_house_for_yukinami = [];
    let hinanii_house_for_seisomura = [];
    let seisomura_for_hinanii_house = [];
    if(pillager_for_yukinami.length === 0){
        for(let i = 0;i < 79;i++){
            const timeflug = [0,15,30,45];
            const timeflugrush = [7,22,37,52];
            const hour = Math.floor((2 + i) * 15 / 60 % 24);
            pillager_for_yukinami.push(
                {
                    type: "local",
                    time: `${i < 22 ? "0" : ""}${hour + 4}:${timeflug[(i + 2) % 4] < 10 ? `0${timeflug[(i + 2) % 4]}` : timeflug[(i + 2) % 4]}`,
                    weekday: true,
                    holiday: true,
                    bound_for: i === 18 ? "mangroverin": "yukinami"
                }
            );
            if(i >= 13 && i <= 22){
                pillager_for_yukinami.push(
                    {
                        type: "local",
                        time: `${i < 22 ? "0" : ""}${hour + 4}:${timeflugrush[(i + 2) % 4] < 10 ? `0${timeflugrush[(i + 2) % 4]}` : timeflugrush[(i + 2) % 4]}`,
                        weekday: true,
                        holiday: false,
                        bound_for: "yukinami"
                    }
                );
            }
        }
    }
    if(yukinami_for_pillager.length === 0){
        for(let i = 0;i < 79;i++){
            const timeflug = [5,20,35,50];
            const timeflugrush = [12,27,42,57];
            const hour = Math.floor((2 + i) * 15 / 60 % 24);
            yukinami_for_pillager.push(
                {
                    type: i % 2 === 0 && (i + 4) % 4 === 0 && i <= 72 ? "rapid" : i % 2 === 1 && i <= 71 ? "rapid" : "local",
                    time: `${i < 22 ? "0" : ""}${hour + 4}:${timeflug[(i + 2) % 4] < 10 ? `0${timeflug[(i + 2) % 4]}` : timeflug[(i + 2) % 4]}`,
                    weekday: true,
                    holiday: true,
                    bound_for: i % 2 === 0 && (i + 4) % 4 === 0 && i <= 72 ? "daiichi_kyoten" : 
                        i <= 76 && i % 2 === 0 ? "hananomori" : i % 2 === 0 ? "pillager_zensyokiti" :
                        i <= 71 ? "seikishi" : i <= 73 ? "hanamori_airport" : i <= 75 ? "akatenboudai" :
                        "pillager_zensyokiti"
                }
            );
            if(i >= 7 && i <= 16){
                yukinami_for_pillager.push(
                    {
                        type: "local",
                        time: `0${hour + 4}:${timeflugrush[(i + 2) % 4] < 10 ? `0${timeflugrush[(i + 2) % 4]}` : timeflugrush[(i + 2) % 4]}`,
                        weekday: true,
                        holiday: false,
                        bound_for: i % 2 === 0 ? "hananomori" : "hanamori_airport"
                    }
                );
            }
        }
    }
    if(hinanii_house_for_yukinami.length === 0){
        for(let i = 0;i < 20;i++){
            // パターンダイヤ
            hinanii_house_for_yukinami.push(
                {
                    type: "local",
                    time: `${i < 6 ? "0" : ""}${i + 4}:30`,
                    weekday: true,
                    holiday: true,
                    bound_for: i === 3 ? "pillager_zensyokiti" : "yukinami"
                }
            );
        }
    }
    if(yukinami_for_hinanii_house.length === 0){
        for(let i = 0;i < 20;i++){
            // パターンダイヤ
            yukinami_for_hinanii_house.push(
                {
                    type: "local",
                    time: `${i < 6 ? "0" : ""}${i + 4}:59`,
                    weekday: true,
                    holiday: true,
                    bound_for: yukinami_for_hinanii_house_fortable[i]
                }
            );
        }
    }
    if(hinanii_house_for_seisomura.length === 0){
        for(let i = 0;i < 20;i++){
            // パターンダイヤ
            if(hinanii_house_for_seisomura_typetable[i] === "rapid"){
                hinanii_house_for_seisomura.push(
                    {
                        type: "local",
                        time: `${i < 6 ? "0" : ""}${i + 4}:25`,
                        weekday: true,
                        holiday: true,
                        bound_for: hinanii_house_for_seisomura_fortable[i]
                    }
                );
            } else {
                hinanii_house_for_seisomura.push(
                    {
                        type: "local",
                        time: `${i < 6 ? "0" : ""}${i + 4}:32`,
                        weekday: true,
                        holiday: true,
                        bound_for: hinanii_house_for_seisomura_fortable[i]
                    }
                );
            }
        }
    }
    if(seisomura_for_hinanii_house.length === 0){
        for(let i = 0;i < 20;i++){
            // パターンダイヤ
            if(seisomura_for_hinanii_house_typetable[i] === "rapid"){
                seisomura_for_hinanii_house.push(
                    {
                        type: "rapid",
                        time: `${i < 5 ? "0" : ""}${i + 5}:06`,
                        weekday: true,
                        holiday: true,
                        bound_for: hinanii_house_for_seisomura_fortable[i]
                    }
                );
            } else {
                seisomura_for_hinanii_house.push(
                    {
                        type: "local",
                        time: `${i < 5 ? "0" : ""}${i + 5}:13`,
                        weekday: true,
                        holiday: true,
                        bound_for: hinanii_house_for_seisomura_fortable[i]
                    }
                );
            }
        }
    }
    if (req.method === 'GET') {
        return res.status(200).json({
            pillager: pillager_for_yukinami,
            yukinami: {
                for_pillager: yukinami_for_pillager,
                for_hinanii: yukinami_for_hinanii_house
            },
            hinanii_house: {
                for_yukinami: hinanii_house_for_yukinami,
                for_seisomura: hinanii_house_for_seisomura
            },
            seisomura: seisomura_for_hinanii_house,
            minamitaisetsu: []
        });
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
