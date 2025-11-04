import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const hinanii_house_for_seisomura_typetable = [
        "local",  "local",  "local",  "rapid",  "local",  "rapid",  "local",  "rapid",  "local",  "rapid", 
        "rapid",  "local",  "rapid",  "rapid",  "rapid",  "rapid",  "rapid",  "rapid",  "rapid",  "local", 
    ];
    const hinanii_house_for_seisomura_fortable = [
        "mangroverin", "minamitaisetsu", "iemon_house", "mangroverin", "minamitaisetsu", "seisomura",
        "mangroverin", "minamitaisetsu", "seisomura", "mangroverin", "minamitaisetsu", "seisomura",
        "mangroverin", "minamitaisetsu", "iemon_house", "minamitaisetsu", "iemon_house", "mangroverin",
        "minamitaisetsu", "seisomura",
    ];
    let pillager_for_yukinami = [];
    let hinanii_house_for_yukinami = [];
    let hinanii_house_for_seisomura = [];
    if(pillager_for_yukinami.length === 0){
        for(let i = 0;i < 79;i++){
            const timeflug = [0,15,30,45];
            const timeflugrush = [7,22,37,52];
            const hour = Math.floor((2 + i) * 15 / 60 % 24);
            pillager_for_yukinami.push(
                {
                    type: "local",
                    time: `${i < 22 ? "0" : ""}${hour + 4}:${timeflug[(i + 2) % 4] < 10 ? `0${timeflug[(i + 2) % 4]}` : timeflug[(i + 2) % 4]}`,
                    bound_for: i === 18 ? "mangroverin": "yukinami"
                }
            );
            if(i >= 13 && i <= 22){
                pillager_for_yukinami.push(
                    {
                        type: "local",
                        time: `${i < 22 ? "0" : ""}${hour + 4}:${timeflugrush[(i + 2) % 4] < 10 ? `0${timeflugrush[(i + 2) % 4]}` : timeflugrush[(i + 2) % 4]}`,
                        bound_for: "yukinami"
                    }
                )
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
                    bound_for: i === 3 ? "pillager_zensyokiti" : "yukinami"
                }
            );
        }
    }
    if(hinanii_house_for_seisomura.length === 0){
        for(let i = 0;i < 20;i++){
            // パターンダイヤ
            hinanii_house_for_seisomura.push(
                {
                    type: hinanii_house_for_seisomura_typetable[i],
                    time: `${i < 6 ? "0" : ""}${i + 4}:${hinanii_house_for_seisomura_typetable[i] === "rapid" ? "25" : "32"}`,
                    bound_for: hinanii_house_for_seisomura_fortable[i]
                }
            );
        }
    }
    if (req.method === 'GET') {
        return res.status(200).json({
            pillager: pillager_for_yukinami,
            yukinami: {
                for_pillager: [],
                for_hinanii: []
            },
            hinanii_house: {
                for_yukinami: hinanii_house_for_yukinami,
                for_seisomura: hinanii_house_for_seisomura
            },
            seisomura: [],
            minamitaisetsu: []
        });
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
