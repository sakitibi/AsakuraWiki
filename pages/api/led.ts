import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

const COLS = 128;
const ROWS = 32;

interface ResponseData {
    matrix: number[][];
    color: string;
}

let fontLoaded = false;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | { error: string }>
) {
    // CORSヘッダーの設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    } else if (req.method === 'POST') {
        const { text = "", color = "#FF0000" } = req.body;
        // --- 1. フォントの動的ロード ---
        if (!fontLoaded) {
            try {
                const fontUrl = 'https://github.com/googlefonts/noto-cjk/raw/main/Sans/SubsetOTF/JP/NotoSansCJKjp-Bold.otf'; 
                const fontRes = await fetch(fontUrl);
                
                if (fontRes.ok) {
                    const fontBuffer = await fontRes.arrayBuffer();
                    GlobalFonts.register(Buffer.from(fontBuffer), 'CustomLED');
                    fontLoaded = true;
                }
            } catch (e) {
                console.error("Font Load Error:", e);
            }
        }

        // --- 2. Canvasの作成と描画 ---
        const canvas = createCanvas(COLS, ROWS);
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;

        // 背景を真っ黒で塗りつぶし
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, COLS, ROWS);
        
        // 取得したフォントを適用 (CustomLED)
        ctx.font = 'bold 24px "CustomLED", sans-serif'; 
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        
        // 文字の幅を計測して中央寄せの開始位置を計算
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const startX = Math.max(0, (COLS - textWidth) / 2);
        
        // 文字を描画
        ctx.fillText(text, startX, ROWS / 2);

        // --- 3. ビット配列（128x32）への変換 ---
        const imgData = ctx.getImageData(0, 0, COLS, ROWS);
        const data = imgData.data;
        const matrix: number[][] = [];

        for (let y = 0; y < ROWS; y++) {
            const row: number[] = [];
            for (let x = 0; x < COLS; x++) {
                // RGBAデータ: [R, G, B, A, R, G, B, A, ...]
                const index = (y * COLS + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // 明るさの閾値判定。白に近いピクセルを 1 とする
                row.push(r > 128 || g > 128 || b > 128 ? 1 : 0);
            }
            matrix.push(row);
        }

        return res.status(200).json({ matrix, color });
    } else {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}