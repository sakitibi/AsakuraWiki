import React from 'react';
import Calendar2 from '@/components/Calendar2';
import CommentForm from '@/components/CommentForm';
import RealTimeComments from '@/components/RealTimeComments';
import PagedComments from '@/components/PagesComments';
import { DATEDIF, DATEVALUE } from './dateFunctions';

type Context = {
    wikiSlug: string;
    pageSlug: string;
};

/**
 * Wiki 本文中のプラグイン構文を ReactNode 配列に変換
 */
export function parseWikiContent(
    content: string,
    context: Context
): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    // 各プラグインの正規表現（キャプチャ順に注意）
    const CAL_RE        = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)/; 
    const DATEDIF_RE   = /#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)/;
    const DATEVALUE_RE = /#DATEVALUE\(\s*([^)]+)\s*\)/;
    const ACC_RE        = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/;
    const COMMENT_RE    = /#comment\b/;
    const RTCM_RE       = /#rtcomment\b/;
    const PCOMM_RE      = /#pcomment\b/;

    // 全体を OR 結合して g フラグを付与
    const re = new RegExp(
        [
        CAL_RE.source,
        DATEDIF_RE.source,
        DATEVALUE_RE.source,
        ACC_RE.source,
        COMMENT_RE.source,
        RTCM_RE.source,
        PCOMM_RE.source,
        ].join('|'),
        'g'
    );

    let m: RegExpExecArray | null;
    while ((m = re.exec(content))) {
        // マッチ前テキストを push
        if (m.index > lastIndex) {
            nodes.push(content.slice(lastIndex, m.index));
        }

        // 1) #calendar2(YYYYMM[,off])
        if (m[1] && m[2]) {
            const year  = +m[1];
            const month = +m[2];
            const off   = m[3] === 'off';
            nodes.push(
                <Calendar2
                key={`cal-${m.index}`}
                year={year}
                month={month}
                hideHolidays={off}
                />
            );
        }
        // 2) #DATEDIF(start,end,unit)
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
        // 3) #DATEVALUE(text)
        else if (m[7]) {
            const txt = m[7];
            const val = DATEVALUE(txt);
            nodes.push(
                <span key={`dv-${m.index}`} className="datevalue-result">
                {isNaN(val) ? 'ERR' : val}
                </span>
            );
        }
        // 4) #accordion(title,level,state){{body}}
        else if (m[8] && m[9] && m[10] && m[11] !== undefined) {
            const title   = m[8];
            const level   = m[9];             // "*","**","***"
            const isOpen  = m[10] === 'open';
            const body    = m[11];
            const Heading = level === '*'  ? 'h3'
                            : level === '**' ? 'h4'
                            : 'h5';

            // アコーディオン内部も再帰的にパース
            const children = parseWikiContent(body, context);

            nodes.push(
                <details key={`acc-${m.index}`} open={isOpen}>
                <summary>{React.createElement(Heading, {}, title)}</summary>
                <div>
                    {children.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                    ))}
                </div>
                </details>
            );
        }
        // 5) #comment
        else if (m[12]) {
            nodes.push(<CommentForm key={`cf-${m.index}`} />);
        }
        // 6) #rtcomment
        else if (m[13]) {
            nodes.push(
                <RealTimeComments
                key={`rtc-${m.index}`}
                wikiSlug={wikiSlug}
                pageSlug={pageSlug}
                />
            );
        }
        // 7) #pcomment
        else if (m[14]) {
            nodes.push(
                <PagedComments
                key={`pc-${m.index}`}
                wikiSlug={wikiSlug}
                pageSlug={pageSlug}
                />
            );
        }

        lastIndex = re.lastIndex;
    }

    // 残りテキストを push
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex));
    }

    return nodes;
}