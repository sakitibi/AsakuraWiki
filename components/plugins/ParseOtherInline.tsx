import { extractBracedBlock, isValidLineRange } from "@/utils/parsePlugins";
import Calendar2 from '@/components/plugins/Calendar2';
import CommentForm from '@/components/plugins/CommentForm';
import RealTimeComments from '@/components/plugins/RealTimeComments';
import PageList from '@/components/plugins/PageList';
import PageList2 from '@/components/plugins/PageList2';
import IncludePage from '@/components/plugins/IncludePage';
import TableOfContents from '@/components/plugins/TableOfContents';
import calcPlugin from '@/components/plugins/calcPlugin';
import { DATEDIF, DATEVALUE } from '@/utils/dateFunctions';
import type { Context } from "@/components/plugins/parsePluginTypes";
import versions from "@/utils/version";
import type { ReactNode } from "react";
import FunctionCallRenderer from "@/components/plugins/functionCall";

/** 既存の #calendar2 や #comment 系を処理するヘルパー */
export default function parseOtherInline(
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
    let last:number = 0
    let m: RegExpExecArray | null
    // 各プラグインを順次キャプチャする正規表現
    const re:RegExp = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9-]+)\s*,\s*([0-9-]+)\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment(?:\(\))?|#comment|#hr|#br|&br;|#ls(?:\(([^)]+)\))?|#ls2\(\s*([^[\],]+)(?:\[\s*([^\]]+)\s*\])?(?:,\s*\{\s*([^}]+)\s*\})?(?:,\s*([^)]+))?\)|#include\(([^)]+)\)|#contents|^CENTER:\s*(.+)|^LEFT:\s*(.+)|^RIGHT:\s*(.+)|&size\((\d+)\)\{([^}]+)\};|\[\[([^\]>]+)>([^\]]+)\]\]|&color\(\s*([^)]+?)\s*(?:,\s*([^)]+?))?\)\{([\s\S]*?)\};|&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);|&escape\(\)\{([\s\S]*?)\}|#marquee\(([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*)(?:,([^)]*))?\)|#const\(\s*([^:]+?)\s*:\s*([^)]+?)\s*\)\{([^\}]+?)\};|#let\(\s*([^:]+?)\s*:\s*([^)]+?)\s*\)\{([^\}]+?)\};|&const-use\(([^)]+?)\);|&let-use\(([^)]+?)\);|&relet\(([^)]+?)\);|&calc\(([^)]+?)\);|&version\(([0123])\);|&new(?:\(([^)]*)\))?\{([^\}]+)\};|&function-call\(\s*([a-zA-Z0-9_]+)\s*(?:,\s*([^)]+))?\s*\);/giu

    while ((m = re.exec(line))) {
        const token:string = m[0];
        const key:string = `inl-${baseKey}-${m.index}`;

        // 🔍 ログ: キャプチャされたトークンと位置
        console.log(`[plugin-match] token: "${token}" at index ${m.index}`);
        if (m.index > last) {
            const plainText = line.slice(last, m.index);
            nodes.push(plainText);

            // 🔍 ログ: プレーンテキスト部分
            console.log(`[text] before plugin: "${plainText}"`);
        }
        //console.table(m);
        console.log('[debug] raw line:', JSON.stringify(line));
        if (line.trim().includes('&function-call(')) {
            console.log('[debug] line includes &function-call');
        } else {
            console.log('[debug] line not includes &function-call');
        }
        // --- plugin branches ---
        // #calendar2(Y,M,off?)
        if (token.startsWith('#marquee')) {
            const text:string = m[28];
            const loop:string = m[29];
            const slide:string = m[30];
            const bgColor:string = m[31];
            const color:string = m[32];
            const size:string = m[33];
            const fontSize:string = size ? `${size}px` : 'inherit';

            const iterationCount:number | 'infinite' = loop && /^\d+$/.test(loop)
                ? Number(loop)
                : 'infinite';

            // 画面サイズから suffix を決定
            let sizeSuffix:'xl'|'sm'|'md' = 'xl';
            if (typeof window !== 'undefined') {
                const screenWidth = window.innerWidth;
                if (screenWidth < 700) {
                    sizeSuffix = 'sm';
                } else if (screenWidth < 1000) {
                    sizeSuffix = 'md';
                }
            }

            // animation名を単純な文字列として構築（CSS Modules不要！）
            const animationBase:"scroll-slide-once" | "scroll-alternate" | "scroll-default" =
                slide === 'slide'
                ? 'scroll-slide-once'
                : slide === 'alternate'
                ? 'scroll-alternate'
                : 'scroll-default';
            const animationName:string = `${animationBase}-${sizeSuffix}`;

            const animationStyle:React.CSSProperties = {
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
            const braceStart = token.indexOf('{');
            const braceBlock = extractBracedBlock(token, braceStart, 1); // ✅ 修正ここ！
            console.log(`[plugin-parse] &size|&color braceBlock.body: "${braceBlock.body}"`);
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
                />
            )
            last = m.index + token.length
        }
        // #DATEDIF(d1,d2,unit)
        else if (token.startsWith('#DATEDIF')) {
            const val:number = DATEDIF(m[4], m[5], m[6])
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #DATEVALUE(str)
        else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #comment(above|below)
        else if (token.startsWith('#comment')) {
            const match = token.match(/^#comment(?:\(\s*(above|below)\s*\))?$/);
            const raw = match?.[1];

            const position: 'above' | 'below' =
                raw === 'below' ? 'below' : 'above';

            nodes.push(
                <CommentForm
                    key={key}
                    wikiSlug={wikiSlug}
                    pageSlug={pageSlug}
                    position={position}
                />
            );

            last = m.index + token.length;
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
            const prefix:string | undefined = safeTrim(m[8]) || undefined
            nodes.push(<PageList key={key} prefix={prefix} />)
            last = m.index + token.length
        }
        // #ls2(pattern[,…][,…][,…])
        else if (token.startsWith('#ls2')) {
            // m[9] = パターン (例: 'Foo/')
            // m[10] = [オプションリスト]
            // m[11] = {include,...} ブロック型オプション
            // m[12] = 表示用ラベル
            const pattern:string = safeTrim(m[9])
            const opts:string[] = m[10]?.split(',').map(s => safeTrim(s)) ?? []
            const blockOpts:string[] = m[11]?.split(',').map(s => safeTrim(s)) ?? []
            const label:string = safeTrim(m[12])

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
            const arg:string = safeTrim(m[13]!)
            const parts:string[] = arg.split(',').map(s => safeTrim(s))
            const [first, lineRange, flag] = parts

            let showTitle: boolean | undefined
            if (flag === 'notitle') showTitle = false
            else if (flag === 'none') showTitle = false
            else if (flag === 'title') showTitle = true

            let pageName:string = first
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
            const centered:string = safeTrim(m[14]);
            const inner:ReactNode[] = parseOtherInline(centered, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'center' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }

        else if (m[15]) {
            const aligned:string = safeTrim(m[15]);
            const inner:ReactNode[] = parseOtherInline(aligned, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'left' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }

        else if (m[16]) {
            const aligned:string = safeTrim(m[16]);
            const inner:ReactNode[] = parseOtherInline(aligned, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'right' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }
        else if (token.startsWith('&size(')) {
            console.log('[parse] &size match OK');
            const sizeStart:number = token.indexOf('(');
            const braceStart:number = token.indexOf('{');
            const fontSize:number = parseInt(token.slice(sizeStart + 1, braceStart - 1), 10);

            const braceBlock = extractBracedBlock(token, braceStart, 1);
            console.log(`[plugin-parse] &size|&color braceBlock.body: "${braceBlock.body}"`);

            // 🔍 ログ: &size 構文詳細
            console.log(`[&size] size: ${fontSize}px, inner: ${braceBlock.body}`);

            const hasBlockPlugin:boolean = /#accordion|#fold|#sel_container|#sel_row/.test(braceBlock.body);
            const content:string | ReactNode[] = hasBlockPlugin
                ? braceBlock.body
                : parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1);

            nodes.push(
                <span key={key} style={{ fontSize: `${fontSize}px` }}>
                    {content}
                </span>
            );
            last = m.index + token.length;
            continue;
        }
        else if (token.startsWith('&color(')) {
            const parenStart:number = token.indexOf('(')
            const parenEnd:number = token.indexOf(')', parenStart)
            const braceStart:number = token.indexOf('{');
            if (parenEnd === -1 || braceStart === -1) {
                nodes.push(<span key={key} style={{ color: 'red' }}>構文エラー: &color 構文不正</span>)
                continue
            }
            const braceBlock = extractBracedBlock(token, braceStart, 1); // ✅ 修正ここ！
            console.log(`[plugin-parse] &size|&color braceBlock.body: "${braceBlock.body}"`);
            const args:string[]= token.slice(parenStart + 1, parenEnd).split(',').map(s => safeTrim(s))
            const color:string = args[0]
            const background:string = args[1]

            const content:ReactNode[] = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1)

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
            const plainLink:RegExpMatchArray | null = token.match(/\[\[([^\]]+)\]\]/)
            const labeledLink:RegExpMatchArray | null = token.match(/\[\[([^\]>]+)>([^\]]+)\]\]/)
            if (labeledLink) {
                const label:string = labeledLink[1].trim()
                const url:string = labeledLink[2].trim()
                const inner:ReactNode[] = parseOtherInline(label, wikiSlug, pageSlug, context, baseKey + 1)
                nodes.push(<a key={key} href={url}>{inner}</a>)
                last = m.index + token.length // ✅ここを追加
                continue
            } else if (plainLink) {
                const url:string = plainLink[1].trim()
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
            const match:RegExpMatchArray | null = token.match(/&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);?/)
            if (match) {
                const url:string = match[1].trim()
                const width:number = parseInt(match[2], 10)
                const height:number = parseInt(match[3], 10)
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
            const varName:string = m[35].trim();
            const varType:string = m[36].trim();
            const varValue:string = m[37].trim();
            context.constContext = context.constContext ?? {};

            if (varName in context.constContext) {
                nodes.push(
                    <span key={key} style={{ color: 'red' }}>定数 {varName} は再定義不可！</span>
                );
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
            const varName:string = m[38].trim();
            const varType:string = m[39].trim();
            const varValue:string = m[40].trim();
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
            const varName:string = m[41].trim();
            const value:string | undefined = context.constContext?.[varName];
            nodes.push(
                <span key={key}>
                    {value ?? `[定数未定義:${varName}]`}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[42]) {
        // &let-use(name);
            const varName:string = m[42].trim();
            const value:string | undefined = context.letContext?.[varName];
            nodes.push(
                <span key={key}>
                    {value ?? `[変数未定義:${varName}]`}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[43]) {
            // &relet(name);
            const varName:string = m[43].trim();
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
            const args:string[] = m[44].split(',').map(s => s.trim());
            const [expression, decStr, style, intStr] = args;
            const decimals:number = decStr !== undefined ? Number(decStr) : 0;
            const integers:number | undefined = intStr !== undefined ? Number(intStr) : undefined;
            const resolvedExpr:string = expression.replace(/\b[a-zA-Z_]\w*\b/g, varName => {
                return context.constContext?.[varName] ?? context.letContext?.[varName] ?? varName;
            });
            try {
                const result = calcPlugin(resolvedExpr, decimals, style, integers);
                nodes.push(
                    <span key={key}>{result}</span>
                );
            } catch (e) {
                nodes.push(
                    <span key={key} style={{ color: 'red' }}>計算失敗</span>
                );
            }
            last = m.index + token.length;
        }
        else if (token.startsWith('&version(')) {
            const type:string = m[45]; // ← インデックスは正規表現のキャプチャ順に応じて調整
            const index:number = parseInt(type, 10);
            const value:string = versions[index];
            nodes.push(
                <span key={key}>
                    {value ?? `[未定義のversion:${type}]`}
                </span>
            );
            last = m.index + token.length;
        }
        else if (token.startsWith('&new')) {
            const args = m[46]?.split(',').map(s => s.trim()) ?? [];
            const dateStr = m[47]?.trim();
            const keyStr = `inl-${baseKey}-${m.index}`;

            // 日付文字列から Date オブジェクトを生成
            const parsedDate = new Date(dateStr.replace(/\(.*?\)/, '').trim()); // 曜日を除去
            if (isNaN(parsedDate.getTime())) {
                nodes.push(
                    <span key={keyStr} style={{ color: 'red' }}>日付形式エラー</span>
                );
                last = m.index + token.length;
            }

            const now:Date = new Date();
            const diffMs:number = now.getTime() - parsedDate.getTime();
            const diffDays:number = diffMs / (1000 * 60 * 60 * 24);

            let label:string = '';
            if (diffDays <= 1) label = 'New!';
            else if (diffDays <= 5) label = 'New';

            const showDate = !args.includes('nodate');

            nodes.push(
                <span key={keyStr} style={{
                    fontWeight: 'bold',
                    fontSize: '80%'
                }}>
                    {showDate ? dateStr : ''} <span style={{
                        color: diffDays <= 1 ?
                        'red' : diffDays <= 3 ?
                        'orange' : diffDays <= 5 ?
                        'green' : 'inherit'
                    }}>{label}</span>
                </span>
            );

            last = m.index + token.length;
        }
        else if (m[48]) {
            const name = m[48].trim();
            const argsRaw = m[49];
            const args = argsRaw ? argsRaw.split(',').map(s => s.trim()) : [];

            console.log('[ParseInline] function-call via m[48]:', { name, args });

            nodes.push(
                <FunctionCallRenderer
                    key={key}
                    name={name}
                    args={args}
                    context={context}
                />
            );
            last = m.index + token.length;
        }
    }
    // 最後に残ったテキスト
    if (last < line.length) {
        const rest:string = line.slice(last).trim()

        // 不要な }; が出るならここで除去
        const cleaned:string = rest.replace(/^};+$/, '')

        const splitByEscapedNewline:string[] = cleaned.split(/\\n/)
        for (let i = 0; i < splitByEscapedNewline.length; i++) {
            if (splitByEscapedNewline[i]) {
                nodes.push(splitByEscapedNewline[i])
            }
            if (i < splitByEscapedNewline.length - 1) {
                nodes.push(
                    <br key={`${baseKey}-br-${last}-${i}`} />
                )
            }
        }
    }
    return nodes
}