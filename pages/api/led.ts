import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas } from 'canvas';

const COLS = 128;
const ROWS = 32;

interface ResponseData {
    matrix: number[][];
    color: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text = "", color = "#FF0000" } = req.body;

    // 1. 128x32のCanvasを作成
    const canvas = createCanvas(COLS, ROWS);
    const ctx = canvas.getContext('2d');

    ctx.antialias = 'none';

    // 背景を真っ黒に塗りつぶし
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, COLS, ROWS);
    
    // フォント設定
    ctx.font = 'bold 26px "sans-serif"'; 
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // 文字を描画（中央配置）
    ctx.fillText(text, COLS / 2, ROWS / 2);

    // 2. ピクセルデータを取得してビット配列(0/1)に変換
    const imageData = ctx.getImageData(0, 0, COLS, ROWS).data;
    const matrix: number[][] = [];

    for (let y = 0; y < ROWS; y++) {
        const row: number[] = [];
        for (let x = 0; x < COLS; x++) {
            // RGBAの構造は [R, G, B, A, R, G, B, A, ...]
            const index = (y * COLS + x) * 4;
            const r = imageData[index]; 
            
            // R値が128(中間値)より大きければ「1」、それ以外は「0」
            // アンチエイリアスをオフにしていれば、ここが明確に分かれます
            row.push(r > 128 ? 1 : 0);
        }
        matrix.push(row);
    }

    // クライアントが期待する形式でレスポンスを返す
    res.status(200).json({ 
        matrix, 
        color 
    });
}