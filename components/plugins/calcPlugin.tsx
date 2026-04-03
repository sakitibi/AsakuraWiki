import { evaluate } from 'mathjs';

export default function calcPlugin(
    expression: string,
    decimals: number = 0,
    style?: string,
    integers?: number
): string {
    let result = evaluate(expression); // 式の評価（安全に！）

    // 小数部の丸め
    if (decimals >= 0) {
        result = result.toFixed(decimals);
    } else {
        result = result.toPrecision(15);
    }

    // コンマ区切り
    if (style === 'comma') {
        result = Number(result).toLocaleString();
    }

    // ゼロ埋め
    if (style === 'zeropad' && integers) {
        const [intPart, decPart = ''] = result.split('.');
        const padded = intPart.padStart(integers, '0');
        result = decPart ? `${padded}.${decPart}` : padded;
    }

    return result;
}