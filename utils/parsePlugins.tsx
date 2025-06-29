import React from 'react';
import Calendar2 from '@/components/Calendar2';
import { DATEDIF, DATEVALUE } from './dateFunctions';

const CAL_RE      = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)/; 
const DATEDIF_RE = /#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)/;
const DATEVALUE_RE= /#DATEVALUE\(\s*([^)]+)\s*\)/;
const ACC_RE      = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/;

export function parseWikiContent(content: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    // 全プラグインを OR でまとめる（最後に g フラグを付与）
    const re = new RegExp([
        CAL_RE.source,
        DATEDIF_RE.source,
        DATEVALUE_RE.source,
        ACC_RE.source
    ].join('|'), 'g');

    let m: RegExpExecArray | null;
    while ((m = re.exec(content))) {
        // 1) マッチ前テキスト
        if (m.index > lastIndex) {
        nodes.push(content.slice(lastIndex, m.index));
        }

        // 2) #calendar2(YYYYMM[,off])
        if (m[1] && m[2]) {
            const year  = Number(m[1]);
            const month = Number(m[2]);
            const off   = m[3] === 'off';
            nodes.push(
                <Calendar2
                key={`cal-${year}-${month}-${m.index}`}
                year={year}
                month={month}
                hideHolidays={off}
                />
            );
        }
        // 3) #DATEDIF(start,end,unit)
        else if (m[4] && m[5] && m[6]) {
            const start = m[4];
            const end   = m[5];
            const unit  = m[6] as 'Y' | 'M' | 'D';
            const val   = DATEDIF(start, end, unit);
            nodes.push(
                <span key={`dif-${m.index}`} className="datedif-result">
                {isNaN(val) ? 'ERR' : val}
                </span>
            );
        }
        // 4) #DATEVALUE(text)
        else if (m[7]) {
            const txt = m[7];
            const val = DATEVALUE(txt);
            nodes.push(
                <span key={`dv-${m.index}`} className="datevalue-result">
                {isNaN(val) ? 'ERR' : val}
                </span>
            );
        }
        // 5) #accordion(title,level,open|close){{body}}
        else if (m[8] && m[9] && m[10] && m[11] !== undefined) {
            const title = m[8];
            const level = m[9];            // "*","**" or "***"
            const isOpen= m[10] === 'open';
            const body  = m[11];
            const Tag   = level === '*'  ? 'h3'
                        : level === '**' ? 'h4'
                        : 'h5';
            nodes.push(
                <details key={`acc-${m.index}`} open={isOpen}>
                <summary>{React.createElement(Tag, {}, title)}</summary>
                <div>
                    {body.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        <br/>
                    </React.Fragment>
                    ))}
                </div>
                </details>
            );
        }

        lastIndex = re.lastIndex;
    }

    // 6) 残ったテキスト
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex));
    }

    return nodes;
}