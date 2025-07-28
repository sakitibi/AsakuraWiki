import { Context, extractBracedBlock, isValidLineRange } from "@/utils/parsePlugins";
import Header from "@/components/Header";
import Calendar2 from '@/components/Calendar2';
import CommentForm from '@/components/CommentForm';
import RealTimeComments from '@/components/RealTimeComments';
import PageList from '@/components/PageList';
import PageList2 from '@/components/PageList2';
import IncludePage from '@/components/IncludePage';
import TableOfContents from '@/components/TableOfContents';
import calcPlugin from '@/components/calcPlugin';
import { DATEDIF, DATEVALUE } from '@/utils/dateFunctions';

/** インラインプラグインを処理します */
export default function parseInline(text: string, context: Context): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context;
    const nodes: React.ReactNode[] = [];
    let nodeKey = 0;
    text.split(/\r?\n/).forEach((line) => {
        // 1) 見出しか?（*テキスト [anchor] に対応）
        const headingMatch = line.match(/^(\*{1,3})\s*(.+?)(?:\s*\[(.+?)\])?$/);
        if (headingMatch) {
            const stars = headingMatch[1] as "*" | "**" | "***";
            const title = headingMatch[2].trim();
            const anchor = headingMatch[3]?.trim() ?? "";

            nodes.push(
                <Header
                    key={`hdr-${nodeKey++}`}
                    level={stars}
                    title={title}
                    anchor={anchor}
                />
            );
            return;
        }

        // 2) その他の行のインライン解析
        const parsedLine = parseOtherInline(line, wikiSlug, pageSlug, context, nodeKey);
        nodes.push(...parsedLine);
        nodeKey += parsedLine.length || 1;
    });

    return nodes;
}

/** 既存の #calendar2 や #comment 系を処理するヘルパー */
export function parseOtherInline(
    line: string,
    wikiSlug: string,
    pageSlug: string,
    context: Context & {
        letContext?: Record<string, string>;
        constContext?: Record<string, string>;
    },
    baseKey: number,
): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    const safeTrim = (v: unknown) => typeof v === 'string' ? v.trim() : ''
    let last = 0
    let m: RegExpExecArray | null
    // 各プラグインを順次キャプチャする正規表現
    const re = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9-]+)\s*,\s*([0-9-]+)\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment(?:\(\))?|#comment|#hr|#br|&br;|#ls(?:\(([^)]+)\))?|#ls2\(\s*([^[\],]+)(?:\[\s*([^\]]+)\s*\])?(?:,\s*\{\s*([^}]+)\s*\})?(?:,\s*([^)]+))?\)|#include\(([^)]+)\)|#contents|^CENTER:\s*(.+)|^LEFT:\s*(.+)|^RIGHT:\s*(.+)|&size\((\d+)\)\{([^}]+)\};|\[\[([^\]>]+)>([^\]]+)\]\]|&color\(\s*([^)]+?)\s*(?:,\s*([^)]+?))?\)\{([\s\S]*?)\};|&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);|&escape\(\)\{([\s\S]*?)\}|#marquee\(([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*)(?:,([^)]*))?\)|#const\(\s*([^:]+?)\s*:\s*([^)]+?)\s*\)\{([^\}]+?)\};|#let\(\s*([^:]+?)\s*:\s*([^)]+?)\s*\)\{([^\}]+?)\};|&const-use\(([^)]+?)\);|&let-use\(([^)]+?)\);|&relet\(([^)]+?)\);|&calc\(([^)]+?)\);/giu

    while ((m = re.exec(line))) {
        // トークンの手前テキストをそのまま文字ノードに
        if (m.index > last) {
            nodes.push(line.slice(last, m.index))
        }
        const token = m[0]
        const key = `inl-${baseKey}-${m.index}`
        //console.table(m);

        // --- plugin branches ---
        // #calendar2(Y,M,off?)
        if (token.startsWith('#marquee')) {
            const text = m[28];
            const loop = m[29];
            const slide = m[30];
            const bgColor = m[31];
            const color = m[32];
            const size = m[33];
            const fontSize = size ? `${size}px` : 'inherit';

            const iterationCount = loop && /^\d+$/.test(loop)
                ? Number(loop)
                : 'infinite';

            // 画面サイズから suffix を決定
            let sizeSuffix = 'xl';
            if (typeof window !== 'undefined') {
                const screenWidth = window.innerWidth;
                if (screenWidth < 700) {
                    sizeSuffix = 'sm';
                } else if (screenWidth < 1000) {
                    sizeSuffix = 'md';
                }
            }

            // animation名を単純な文字列として構築（CSS Modules不要！）
            const animationBase =
                slide === 'slide'
                ? 'scroll-slide-once'
                : slide === 'alternate'
                ? 'scroll-alternate'
                : 'scroll-default';
            const animationName = `${animationBase}-${sizeSuffix}`;

            const animationStyle = {
                animationName,
                animationDuration:
                    slide === 'slide' ? '5s'
                    : slide === 'alternate' ? '7s'
                    : '15s',
                animationTimingFunction:
                    slide === 'slide' || slide === 'alternate' ? 'ease-in-out' : 'linear',
                animationIterationCount: iterationCount,
                animationDirection: slide === 'alternate' ? 'alternate' : 'normal',
                animationFillMode: slide === 'slide' ? 'forwards' : 'none',
                display: 'inline-block',
            };

            nodes.push(
                <div
                    key={key}
                    style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        backgroundColor: bgColor ?? 'transparent',
                        color: color ?? 'inherit',
                        fontSize,
                    }}
                >
                    <div style={animationStyle}>{text}</div>
                </div>
            );

            last = m.index + token.length;
        }
        else if (token.startsWith('&escape(')) {
            const braceStart = token.indexOf('{')
            const braceBlock = extractBracedBlock(token, braceStart)
            nodes.push(
                <span key={key} dangerouslySetInnerHTML={{ __html: braceBlock.body }} />
            )

            last = m.index + token.length
            continue
        }
        else if (token.startsWith('#calendar2')) {
            const [, y, mo, off] = m
            nodes.push(
                <Calendar2
                    key={key}
                    year={+y}
                    month={+mo}
                    hideHolidays={off === 'off'}
                />
            )
            last = m.index + token.length
        }
        // #DATEDIF(d1,d2,unit)
        else if (token.startsWith('#DATEDIF')) {
            const val = DATEDIF(m[4], m[5], m[6] as any)
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #DATEVALUE(str)
        else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #comment
        else if (token === '#comment') {
            nodes.push(<CommentForm key={key} />)
            last = m.index + token.length
        }
        // #rtcomment
        else if (token.startsWith('#rtcomment')) {
            nodes.push(
                <RealTimeComments
                    key={key}
                    wikiSlug={wikiSlug}
                    pageSlug={pageSlug}
                />
            )
            last = m.index + token.length
        }
        // #hr
        else if (token === '#hr') {
            nodes.push(<hr key={key} />)
            last = m.index + token.length
        }
        else if (token.startsWith('#br')) {
            nodes.push(<br key={key} />)
            last = m.index + token.length
        }
        else if (token.startsWith('&br;')) {
            nodes.push(<br key={key} />)
            last = m.index + token.length
        }
        // #ls([title])
        else if (token.startsWith('#ls')) {
            const prefix = safeTrim(m[8]) || undefined
            nodes.push(<PageList key={key} prefix={prefix} />)
            last = m.index + token.length
        }
        // #ls2(pattern[,…][,…][,…])
        else if (token.startsWith('#ls2')) {
            // m[9] = パターン (例: 'Foo/')
            // m[10] = [オプションリスト]
            // m[11] = {include,...} ブロック型オプション
            // m[12] = 表示用ラベル
            const pattern = safeTrim(m[9])
            const opts = m[10]?.split(',').map(s => safeTrim(s)) ?? []
            const blockOpts = m[11]?.split(',').map(s => safeTrim(s)) ?? []
            const label = safeTrim(m[12])

            nodes.push(
                <PageList2
                    key={key}
                    wikiSlug={wikiSlug}
                    pattern={pattern}
                    options={[...opts, ...blockOpts]}
                    label={label}
                />
            )
            last = m.index + token.length
        }
        // #include(pageName|css,flag)
        else if (token.startsWith('#include')) {
            const arg = safeTrim(m[13]!)
            const parts = arg.split(',').map(s => safeTrim(s))
            const [first, lineRange, flag] = parts

            let showTitle: boolean | undefined
            if (flag === 'notitle') showTitle = false
            else if (flag === 'none') showTitle = false
            else if (flag === 'title') showTitle = true

            let pageName = first
            let stylesheetURL: string | undefined
            if (first.includes('|')) {
                const [name, css] = first.split('|', 2).map(s => safeTrim(s))
                pageName = name
                stylesheetURL = css
            }

            if (lineRange && !isValidLineRange(lineRange)) {
                nodes.push(
                    <div key={key} style={{ color: 'red' }}>
                    読み込み失敗: 無効な行範囲です（format: 1-5, 3-, -4 など）
                    </div>
                )
                continue
            }
            nodes.push(
                <IncludePage
                    key={key}
                    wikiSlug={wikiSlug}
                    page={pageName}
                    showTitle={showTitle}
                    stylesheetURL={stylesheetURL}
                    lineRange={lineRange}
                />
            )
            last = m.index + token.length
        }
        // #contents
        else if (token === '#contents') {
            nodes.push(<TableOfContents key={key} />)
            last = m.index + token.length
        }
        // CENTER:
        else if (m[14]) {
            const centered = safeTrim(m[14]);
            const inner = parseOtherInline(centered, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'center' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }

        else if (m[15]) {
            const aligned = safeTrim(m[15]);
            const inner = parseOtherInline(aligned, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'left' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }

        else if (m[16]) {
            const aligned = safeTrim(m[16]);
            const inner = parseOtherInline(aligned, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'right' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }
        else if (token.startsWith('&size(')) {
            const sizeStart = token.indexOf('(')
            const braceStart = token.indexOf('{', sizeStart)
            const braceBlock = extractBracedBlock(token, braceStart)
            const fontSize = parseInt(token.slice(sizeStart + 1, braceStart - 1), 10)
            const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1)
            nodes.push(
                <span key={key} style={{ fontSize: `${fontSize}px` }}>
                    {content}
                </span>
            )
            last = m.index + token.length // ✅これに変更！
        }
        else if (token.startsWith('&color(')) {
            const parenStart = token.indexOf('(')
            const parenEnd = token.indexOf(')', parenStart)
            const braceStart = token.indexOf('{', parenEnd)
            if (parenEnd === -1 || braceStart === -1) {
                nodes.push(<span key={key} style={{ color: 'red' }}>構文エラー: &color 構文不正</span>)
                continue
            }

            const braceBlock = extractBracedBlock(token, braceStart)

            const args = token.slice(parenStart + 1, parenEnd).split(',').map(s => safeTrim(s))
            const color = args[0]
            const background = args[1]

            const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1)

            nodes.push(
                <span
                key={key}
                style={{
                    ...(color ? { color } : {}),
                    ...(background ? { backgroundColor: background } : {}),
                }}
                >
                <>{Array.isArray(content) ? content : [content]}</>
                </span>
            )

            last = m.index + token.length
            continue
        }
        else if (token.startsWith('[[')) {
            const plainLink = token.match(/\[\[([^\]]+)\]\]/)
            const labeledLink = token.match(/\[\[([^\]>]+)>([^\]]+)\]\]/)
            if (labeledLink) {
                const label = labeledLink[1].trim()
                const url = labeledLink[2].trim()
                const inner = parseOtherInline(label, wikiSlug, pageSlug, context, baseKey + 1)
                nodes.push(<a key={key} href={url}>{inner}</a>)
                last = m.index + token.length // ✅ここを追加
                continue
            } else if (plainLink) {
                const url = plainLink[1].trim()
                nodes.push(
                    <a key={key} href={url}>
                        {url}
                    </a>
                )
            } else {
                nodes.push(token) // 解析できなかった場合はそのまま表示
            }
            last = m.index + token.length
        }
        else if (token.startsWith('&attachref(')) {
            const match = token.match(/&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);?/)
            if (match) {
                const url = match[1].trim()
                const width = parseInt(match[2], 10)
                const height = parseInt(match[3], 10)
                nodes.push(
                    <img key={key} src={url} width={width} height={height} alt={url} />
                )
            } else {
                nodes.push(token)
            }
            last = m.index + token.length
        }
        // 型付き #const(name:type){value};
        else if (m[35] && m[36] && m[37]) {
            const varName = m[35].trim();
            const varType = m[36].trim();
            const varValue = m[37].trim();
            context.constContext = context.constContext ?? {};

            if (varName in context.constContext) {
                nodes.push(<span key={key} style={{ color: 'red' }}>定数 {varName} は再定義不可！</span>);
            } else {
                context.constContext[varName] = varValue;
                nodes.push(
                <span key={key} style={{ display: 'none', fontWeight: 'bold' }}>
                    定数 {varName}（{varType}） = {varValue}
                </span>
                );
            }
            last = m.index + token.length;
        }

        // 型付き #let(name:type){value};
        else if (m[38] && m[39] && m[40]) {
            const varName = m[38].trim();
            const varType = m[39].trim();
            const varValue = m[40].trim();
            context.letContext = context.letContext ?? {};
            context.letContext[varName] = varValue;
            nodes.push(
                <span key={key} style={{ display: 'none', fontStyle: 'italic' }}>
                変数 {varName}（{varType}） ← {varValue}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[41]) {
            // &const-use(name);
            const varName = m[41].trim();
            const value = context.constContext?.[varName];
            nodes.push(
                <span key={key}>
                {value ?? `[定数未定義:${varName}]`}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[42]) {
        // &let-use(name);
            const varName = m[42].trim();
            const value = context.letContext?.[varName];
            nodes.push(
                <span key={key}>
                {value ?? `[変数未定義:${varName}]`}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[43]) {
            // &relet(name);
            const varName = m[43].trim();
            if (context.letContext?.[varName]) {
                nodes.push(
                <span key={key} style={{ display: 'none' }}>
                    再代入OK: {varName}
                </span>
                );
            } else {
                nodes.push(
                <span key={key} style={{ color: 'red' }}>
                    再代入対象 `{varName}` が未定義です
                </span>
                );
            }
            last = m.index + token.length;
        }
        else if (m[44]) {
            const args = m[44].split(',').map(s => s.trim());
            const [expression, decStr, style, intStr] = args;
            const decimals = decStr !== undefined ? Number(decStr) : 0;
            const integers = intStr !== undefined ? Number(intStr) : undefined;
            const resolvedExpr = expression.replace(/\b[a-zA-Z_]\w*\b/g, varName => {
                return context.constContext?.[varName] ?? context.letContext?.[varName] ?? varName;
            });
            try {
                const result = calcPlugin(resolvedExpr, decimals, style, integers);
                nodes.push(<span key={key}>{result}</span>);
            } catch (e) {
                nodes.push(<span key={key} style={{ color: 'red' }}>計算失敗</span>);
            }

            last = m.index + token.length;
        }
    }
    // 最後に残ったテキスト
    if (last < line.length) {
        const rest = line.slice(last).trim()

        // 不要な }; が出るならここで除去
        const cleaned = rest.replace(/^};+$/, '')

        const splitByEscapedNewline = cleaned.split(/\\n/)
        for (let i = 0; i < splitByEscapedNewline.length; i++) {
            if (splitByEscapedNewline[i]) {
                nodes.push(splitByEscapedNewline[i])
            }
            if (i < splitByEscapedNewline.length - 1) {
                nodes.push(<br key={`${baseKey}-br-${last}-${i}`} />)
            }
        }
    }
    return nodes
}