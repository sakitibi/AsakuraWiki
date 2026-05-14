import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas } from 'canvas';

const COLS = 128;
const ROWS = 32;

interface ResponseData {
    matrix: number[][];
    color: string;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text = "", color = "#FF0000" } = req.body;

    // 1. Canvasの作成
    const canvas = createCanvas(COLS, ROWS);
    const ctx = canvas.getContext('2d');

    // アンチエイリアスを切る（ドットをハッキリさせる）
    ctx.antialias = 'none';

    // --- 描画処理 ---
    // 背景を真っ黒で初期化
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, COLS, ROWS);
    
    // 文字の描画設定
    ctx.font = 'bold 24px sans-serif'; 
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left'; // centerより制御しやすい左詰めに変更
    
    // 文字の幅を計測して、中央に来るようにX座標を計算
    const textWidth = ctx.measureText(text).width;
    const startX = Math.max(0, (COLS - textWidth) / 2);
    
    // 文字を描画
    ctx.fillText(text, startX, ROWS / 2);

    // 2. ビット配列への変換
    const imgData = ctx.getImageData(0, 0, COLS, ROWS);
    const data = imgData.data;
    const matrix: number[][] = [];

    for (let y = 0; y < ROWS; y++) {
        const row: number[] = [];
        for (let x = 0; x < COLS; x++) {
            const index = (y * COLS + x) * 4;
            // R, G, B いずれかが高い（白に近い）かチェック
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // 閾値を128に設定。白いピクセル（255,255,255）なら 1 になる
            row.push(r > 128 || g > 128 || b > 128 ? 1 : 0);
        }
        matrix.push(row);
    }

    res.status(200).json({ matrix, color });
}