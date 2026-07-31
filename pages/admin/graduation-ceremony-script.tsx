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
    3: '副部長/ 副委員長 / 元委員長 / 元部長',
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
                                ← 前へ
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
                                次へ →
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