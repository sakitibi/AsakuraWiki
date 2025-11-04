import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
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
    let hinanii_house_for_yukinami = [];
    let hinanii_house_for_seisomura = [];
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
            pillager: [],
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
