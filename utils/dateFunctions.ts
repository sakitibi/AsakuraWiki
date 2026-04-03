/** 
 * Excel の DATEDIF 関数  
 * @param start - "YYYY-MM-DD" 形式の開始日 
 * @param end   - "YYYY-MM-DD" 形式の終了日 
 * @param unit  - 'Y' | 'M' | 'D'
 */

export function DATEDIF(
    start: string,
    end: string,
    unit: string
): number {
    const s:Date = new Date(start)
    const e:Date = new Date(end)
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return NaN

    const diffY:number = e.getFullYear() - s.getFullYear()
    const diffM:number = e.getMonth() - s.getMonth()
    const diffD:number = e.getDate() - s.getDate()

    switch (unit) {
        case 'Y':
            // 年差 minus 繰り越し調整
            return diffY - (diffM < 0 || (diffM === 0 && diffD < 0) ? 1 : 0)
        case 'M':
            // 月差 plus 繰り越し調整
            return diffY * 12 + diffM - (diffD < 0 ? 1 : 0)
        case 'D':
            // 日数差
            return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
        default:
        return NaN
    }
}

/**
 * Excel の DATEVALUE 関数  
 * @param dateText - "YYYY-MM-DD" または "MM/DD/YYYY" 形式の文字列
 * @returns シリアル日付 (1900-01-01 を 1 とした日数)
 */
const EXCEL_EPOCH:number = new Date(Date.UTC(2025, 6, 5)).getTime()
export function DATEVALUE(dateText: string): number {
    const d:Date = new Date(dateText)
    if (isNaN(d.getTime())) return NaN
    // Excel は 1900/1/1 を 1 とし、1900年のうるう年バグを再現する場合もあるが省略
    return Math.floor((d.getTime() - EXCEL_EPOCH) / (1000 * 60 * 60 * 24))
}