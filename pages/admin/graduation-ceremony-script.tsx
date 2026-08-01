import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabaseClient';
import { asakuraMenberUserId } from '@/utils/user_list';

interface Graduate {
    no: number;
    name: string;
    kana: string;
    role: string;
    rank: 1 | 2 | 3 | 4 | 5 | 6;
}

const graduates: Graduate[] = [
    {
        "no": 2,
        "name": "入江 紗菜",
        "kana": "いりえ さな",
        "role": "社員",
        "rank": 1,
    },
    {
        "no": 10,
        "name": "小佐々 晄",
        "kana": "こざさ ひかる",
        "role": "元副部長",
        "rank": 2,
    },
    {
        "no": 14,
        "name": "髙橋 優乃",
        "kana": "たかはし ゆうの",
        "role": "社員",
        "rank": 1,
    },
    {
        "no": 25,
        "name": "藤田 結衣",
        "kana": "ふじた ゆい",
        "role": "元副部長",
        "rank": 2,
    },
    {
        "no": 26,
        "name": "堀井 清太郎",
        "kana": "ほりい せいたろう",
        "role": "社員",
        "rank": 1,
    },
    {
        "no": 30,
        "name": "横田 彩芽",
        "kana": "よこた あやめ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 32,
        "name": "若山 実生",
        "kana": "わかやま みお",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 33,
        "name": "内林 栞央奈",
        "kana": "うちばやし りおな",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 34,
        "name": "奥村 宙輝",
        "kana": "おくむら ひろき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 35,
        "name": "落合 由莉子",
        "kana": "おちあい ゆりこ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 36,
        "name": "筧 結希",
        "kana": "かけい ゆき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 37,
        "name": "金平 諒太",
        "kana": "かねひら りょうた",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 38,
        "name": "桑折 由惟",
        "kana": "こおり ゆい",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 39,
        "name": "櫻井 蒼太",
        "kana": "さくらい そうた",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 40,
        "name": "清水 環",
        "kana": "しみず かん",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 41,
        "name": "髙岸 昊輝",
        "kana": "たかぎし こうき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 42,
        "name": "髙田 龍之介",
        "kana": "たかだ りゅうのすけ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 43,
        "name": "髙橋 明佳凜",
        "kana": "たかはし あかり",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 44,
        "name": "辻󠄀 葵衣",
        "kana": "つじ あおい",
        "role": "上司",
        "rank": 2
    },
    {
        "no": 45,
        "name": "橋本 真一",
        "kana": "はしもと しんいち",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 46,
        "name": "橋本 稔",
        "kana": "はしもと みのる",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 47,
        "name": "藤村 祐希",
        "kana": "ふじむら ゆうき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 48,
        "name": "古川 花音",
        "kana": "ふるかわ はなね",
        "role": "元副委員長",
        "rank": 2
    },
    {
        "no": 49,
        "name": "増田 拓馬",
        "kana": "ますだ たくま",
        "role": "上司",
        "rank": 2
    },
    {
        "no": 50,
        "name": "松田 海音",
        "kana": "まつだ かいと",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 51,
        "name": "三宅 華",
        "kana": "みやけ はな",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 52,
        "name": "本原 瑛里子",
        "kana": "もとはら えりこ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 53,
        "name": "青地 優依",
        "kana": "あおち ゆい",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 54,
        "name": "井原 彩貴",
        "kana": "いはら さき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 55,
        "name": "今谷 綾汰",
        "kana": "いまだに りょうた",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 56,
        "name": "上野山 悠和",
        "kana": "うえのやま ゆうわ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 57,
        "name": "梅村 銀志",
        "kana": "うめむら ぎんじ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 58,
        "name": "太田 崇雅",
        "kana": "おおた しゅうが",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 59,
        "name": "川本 芽似",
        "kana": "かわもと めい",
        "role": "元副部長",
        "rank": 2
    },
    {
        "no": 60,
        "name": "來山 拓磨",
        "kana": "きたやま たくま",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 62,
        "name": "黒田 大翔",
        "kana": "くろだ やまと",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 63,
        "name": "佐野 葵",
        "kana": "さの あおい",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 64,
        "name": "杉山 七海",
        "kana": "すぎやま ななみ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 114,
        "name": "松村 唯花",
        "kana": "まつむら ゆいか",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 115,
        "name": "清水 菜央",
        "kana": "しみず なお",
        "role": "副部長",
        "rank": 3
    },
    {
        "no": 119,
        "name": "岡本 玲奈",
        "kana": "おかもと れいな",
        "role": "委員長",
        "rank": 4
    },
    {
        "no": 137,
        "name": "嵯峨根 汐莉",
        "kana": "さがね しおり",
        "role": "副委員長",
        "rank": 3
    },
    {
        "no": 153,
        "name": "日花 由依加",
        "kana": "ひばな ゆいか",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 172,
        "name": "谷口 綾音",
        "kana": "たにぐち あやね",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 196,
        "name": "小林 咲久耶",
        "kana": "こばやし さくや",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 197,
        "name": "鎌田 芭菜",
        "kana": "かまだ はな",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 198,
        "name": "上山 幸子",
        "kana": "かみやま さちこ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 199,
        "name": "林 愛瑠",
        "kana": "はやし あびる",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 200,
        "name": "牧山 花",
        "kana": "まきやま はな",
        "role": "元部長",
        "rank": 3
    },
    {
        "no": 201,
        "name": "栗山 愛莉",
        "kana": "くりやま あいり",
        "role": "元副部長",
        "rank": 2
    },
    {
        "no": 202,
        "name": "岸本 夏音",
        "kana": "きしもと かお",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 203,
        "name": "山路 愛蘭",
        "kana": "やまじ あいら",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 204,
        "name": "大橋 由菜",
        "kana": "おおはし ゆな",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 205,
        "name": "藤原 叶芽",
        "kana": "ふじわら かなめ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 206,
        "name": "木戸 玲菜",
        "kana": "きど れな",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 207,
        "name": "永井 優花",
        "kana": "ながい ゆうか",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 208,
        "name": "米田 圭吾",
        "kana": "よねだ けいご",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 209,
        "name": "菅井 美桜",
        "kana": "すがい みお",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 210,
        "name": "宮坂 朋美",
        "kana": "みやさか ともみ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 211,
        "name": "大野 葵生",
        "kana": "おおの あおい",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 214,
        "name": "金森 心紅",
        "kana": "かなもり しんく",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 215,
        "name": "岡 美優",
        "kana": "おか みゆ",
        "role": "元部長",
        "rank": 3
    },
    {
        "no": 216,
        "name": "中山 佳映",
        "kana": "なかやま かえ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 217,
        "name": "中嶋 優月",
        "kana": "なかじま ゆづき",
        "role": "上司",
        "rank": 2
    },
    {
        "no": 219,
        "name": "石井 葉稀",
        "kana": "いしい はづき",
        "role": "元副部長",
        "rank": 2
    },
    {
        "no": 220,
        "name": "上野 凜",
        "kana": "うえの りん",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 221,
        "name": "立川 諒",
        "kana": "たちかわ まこと",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 222,
        "name": "小野 颯太",
        "kana": "おの そうた",
        "role": "副部長",
        "rank": 3
    },
    {
        "no": 223,
        "name": "大枝 幹太",
        "kana": "おおえだ かんた",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 224,
        "name": "鈴木 琉生",
        "kana": "すずき るい",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 225,
        "name": "飯田 明子",
        "kana": "いいだ あきこ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 226,
        "name": "柴 啓一朗",
        "kana": "しば けいいちろう",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 227,
        "name": "深田 環",
        "kana": "ふかだ たまき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 228,
        "name": "神田 隼颯",
        "kana": "かんだ はやて",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 229,
        "name": "山本 翔輝",
        "kana": "やまもと とき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 231,
        "name": "大友 美佐子",
        "kana": "おおとも みさこ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 232,
        "name": "平松 颯季",
        "kana": "ひらまつ さつき",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 233,
        "name": "藪本 六子",
        "kana": "やぶもと ろっこ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 236,
        "name": "木本 蓮太郎",
        "kana": "きもと れんたろう",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 237,
        "name": "平松 叶羽",
        "kana": "ひらまつ とわ",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 239,
        "name": "松村 柑奈",
        "kana": "まつむら かんな",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 240,
        "name": "黒木 聡太郎",
        "kana": "くろき そうたろう",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 250,
        "name": "土居 なな子",
        "kana": "どい ななこ",
        "role": "副部長",
        "rank": 3
    },
    {
        "no": 259,
        "name": "上田 優葵",
        "kana": "うえだ ゆき",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 261,
        "name": "稲葉 千佳",
        "kana": "いなば ちか",
        "role": "元副部長",
        "rank": 2
    },
    {
        "no": 262,
        "name": "松浦 仁太郎",
        "kana": "まつうら じんたろう",
        "role": "社員",
        "rank": 1
    },
    {
        "no": 266,
        "name": "安藤 凛",
        "kana": "あんどう りん",
        "role": "部長",
        "rank": 4
    },
    {
        "no": 271,
        "name": "上田 息吹",
        "kana": "うえだ いぶき",
        "role": "本部長",
        "rank": 6
    },
    {
        "no": 281,
        "name": "三津川 喜生",
        "kana": "みつかわ きい",
        "role": "副本部長",
        "rank": 5
    },
];

const rankColor = {
    1: 'border-blue-500 text-blue-400',
    2: 'border-sky-500 text-sky-400',
    3: 'border-green-500 text-green-400',
    4: 'border-yellow-400 text-yellow-300',
    5: 'border-orange-500 text-orange-400',
    6: 'border-red-600 text-red-500',
} as const;

const rankName = {
    1: 'その他退社社員',
    2: '課長 / 上司 / 元副部長 / 元副委員長',
    3: '副部長 / 副委員長 / 元委員長 / 元部長',
    4: '部長 / 委員長 / 元副本部長',
    5: '副本部長 / 元本部長',
    6: '本部長',
} as const;

export default function GraduationCeremonyScriptPage() {
    const [index, setIndex] = useState(0);
    const [showKana, setShowKana] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const current = useMemo(
        () => graduates[index] ?? null,
        [index]
    );
    const next = useMemo(
        () => graduates[index + 1] ?? null,
        [index]
    );
    const next2 = useMemo(
        () => graduates[index + 2] ?? null,
        [index]
    );

    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    
    const isAuthorized = asakuraMenberUserId.find(value => value === user?.id);

    useEffect(() => {
        const keyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                    setIndex(v => Math.min(v + 1, graduates.length - 1));
                    break;
                case 'ArrowLeft':
                    setIndex(v => Math.max(v - 1, 0));
                    break;
                case 'f':
                case 'F':
                    setShowKana(v => !v);
                    break;
            }
        };

        window.addEventListener('keydown', keyDown);
        return () => {
            window.removeEventListener('keydown', keyDown);
        };
    }, []);
    return (
        <>
            <Head>
                <title>退社式 司会カンペ</title>
            </Head>
            {!user || !isAuthorized ? (
                <>
                    <h1>403 Forbidden</h1>
                </>
            ) : (
                <div className="min-h-screen bg-black text-white">
                    <header className="border-b border-gray-700 px-10 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold">
                                    退社式　司会カンペ
                                </h1>
                                <div className="mt-2 text-gray-400">
                                    ← → ：移動　
                                    F：ふりがな表示切替
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold">
                                    {index + 1}
                                    <span className="mx-2 text-gray-500">
                                        /
                                    </span>
                                    {graduates.length}
                                </div>
                                <div className="text-gray-500">
                                    現在位置
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="p-10">
                        <div className="grid grid-cols-3 gap-8">
                            {[current, next, next2].map((graduate, i) => {
                                const title =
                                    i === 0
                                        ? '現在'
                                        : i === 1
                                        ? '次'
                                        : '次々';
                                return (
                                    <div
                                        key={i}
                                        className={`rounded-xl border-4 bg-neutral-900 p-8 shadow-xl ${
                                            graduate
                                                ? rankColor[graduate.rank]
                                                : 'border-gray-700'
                                        }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-gray-400">
                                                {title}
                                            </div>
                                            {graduate ? (
                                                <>
                                                    <div className="mt-8 text-4xl">
                                                        {graduate.no}番
                                                    </div>
                                                    <div
                                                        className={`mt-10 text-6xl font-bold ${
                                                            rankColor[graduate.rank]
                                                        }`}
                                                    >
                                                        {graduate.name}
                                                    </div>
                                                    {showKana && (
                                                        <div className="mt-5 text-3xl text-gray-300">
                                                            {graduate.kana}
                                                        </div>
                                                    )}
                                                    <div className="mt-10 text-3xl">
                                                        {graduate.role}
                                                    </div>
                                                    <div
                                                        className={`mt-8 text-2xl font-bold ${
                                                            rankColor[graduate.rank]
                                                        }`}
                                                    >
                                                        {rankName[graduate.rank]}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="mt-20 text-4xl text-gray-500">
                                                    該当なし
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-16 flex justify-center gap-8">
                            <button
                                onClick={() =>
                                    setIndex(v => Math.max(v - 1, 0))
                                }
                                className="rounded-lg bg-gray-700 px-10 py-4 text-2xl font-bold transition hover:bg-gray-600"
                            >
                                <span>前へ</span>
                            </button>
                            <button
                                onClick={() =>
                                    setIndex(v =>
                                        Math.min(
                                            v + 1,
                                            graduates.length - 1
                                        )
                                    )
                                }
                                className="rounded-lg bg-blue-700 px-10 py-4 text-2xl font-bold transition hover:bg-blue-600"
                            >
                                <span>次へ</span>
                            </button>
                        </div>
                        <div className="mt-12 rounded-lg border border-gray-700 bg-neutral-900 p-6">
                            <h2 className="mb-4 text-2xl font-bold text-gray-300">
                                操作方法
                            </h2>
                            <ul className="space-y-2 text-xl text-gray-400">
                                <li>← 前の退社社員</li>
                                <li>→ 次の退社社員</li>
                                <li>F ふりがなの表示切替</li>
                            </ul>
                        </div>
                    </main>
                </div>
            )}
        </>
    );
}