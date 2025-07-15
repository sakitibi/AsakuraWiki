import Head from 'next/head';

export default function AsakuraMap() {
    return(
        <>
            <Head>
                <title>あさクラマップ</title>
            </Head>
            <h1>あさクラマップ</h1>
            <main>
                <iframe src="https://www.chunkbase.com/seed-map-embed#seed=2048971879&platform=bedrock_1_21_90&biomeHeight=depth0&zoom=0.247&x=0&z=0&dimension=overworld&showBiomes=true&terrain=true&promo=true&multiplatform=true&bgColor=#21bb5c&theme=light"></iframe>
            </main>
            <details>
                <summary>基準値</summary>
                <ul>
                    <li>第一拠点 x200, z700</li>
                    <li>第二都市 x-400, z800</li>
                    <li>雪波 x-1500, z800</li>
                    <li>メサ市 x700, x1100</li>
                </ul>
            </details>
        </>
    )
}