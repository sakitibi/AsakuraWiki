import React from 'react';
import { designColor } from "@/utils/wiki_settings";
import TableOfContents from '@/components/plugins/TableOfContents';
import { PLUGIN_TRIGGER_REGEX, INDIVIDUAL_REGEX } from '@/components/plugins/ParseOtherInline/regex';
import { ExtendedContext, PluginArgs } from '@/components/plugins/ParseOtherInline/types';
import * as renderers from '@/components/plugins/ParseOtherInline/pluginRenderers';

export function preProcessFuncDefinitions(text: string, context: any): string {
    if (!text) return '';
    context.funcContext = context.funcContext ?? {};
    
    let result = '';
    let i = 0;
    const len = text.length;

    while (i < len) {
        // 「#func」の文字列から始まるブロックを検知
        if (text.slice(i, i + 5) === '#func') {
            const startIdx = i;
            i += 5;

            // 引数の開始カッコ「(」を探す
            while (i < len && text[i] !== '(' && text[i] !== '\n') {
                i++;
            }
            // 改行にぶつかるか、テキストが切れたら #func 構文ではないので通常の文字として処理
            if (i >= len || text[i] === '\n') { 
                result += text.slice(startIdx, i); 
                continue; 
            }

            // 引数のカッコ「( )」の終わりをネスト考慮してスキャン
            const parenStart = i;
            let parenDepth = 0;
            while (i < len) {
                if (text[i] === '(') parenDepth++;
                else if (text[i] === ')') {
                    parenDepth--;
                    if (parenDepth === 0) {
                        i++;
                        break;
                    }
                }
                i++;
            }
            const parenEnd = i;

            // 引数部分の文字列をパース
            const rawArgsStr = text.slice(parenStart + 1, parenEnd - 1);
            const funcArgs = rawArgsStr.split(',').map(s => s.trim());
            const funcName = funcArgs[0];
            const argNames = funcArgs.slice(1);

            // 本体の開始波括弧「{」を探す
            while (i < len && text[i] !== '{' && text[i] !== '\n') {
                i++;
            }
            
            // 【重要】もし1行ずつバラバラにパースされていて、この行に「{」が存在しない場合は
            // 複数行にまたがっているため、ここでは登録処理を保留し、通常の文字として流す
            if (i >= len || text[i] === '\n') {
                // 親コンポーネントが未修正（1行ずつ渡している）状態でもクラッシュを防ぐ
                result += text.slice(startIdx, i);
                continue;
            }

            // 本体の波括弧「{ }」の終わりをネスト考慮してスキャン（改行を跨ぐことを許可）
            const braceStart = i;
            let braceDepth = 0;
            let foundClosingBrace = false;
            while (i < len) {
                if (text[i] === '{') braceDepth++;
                else if (text[i] === '}') {
                    braceDepth--;
                    if (braceDepth === 0) {
                        i++;
                        foundClosingBrace = true;
                        break;
                    }
                }
                i++;
            }
            const braceEnd = i;

            // 閉じ括弧が見つからない（1行ずつバラバラにされた結果、中身が途切れている）場合は
            // 登録をスキップしてそのまま文字として残す
            if (!foundClosingBrace) {
                result += text.slice(startIdx, braceStart + 1);
                i = braceStart + 1;
                continue;
            }

            // 関数の中身 (body) を抽出
            const body = text.slice(braceStart + 1, braceEnd - 1);

            // 有効な関数名であれば context にしっかりと登録
            if (funcName) {
                context.funcContext[funcName] = {
                    argNames,
                    body: body
                };
            }

            // 直後にセミコロン「;」が続いていれば、それも含めてスキップして削り取る
            if (i < len && text[i] === ';') {
                i++;
            }
            
            // #func マクロ定義全体を result から除外（画面に表示させない）
            continue;
        }

        // 通常のテキストはそのまま維持
        result += text[i];
        i++;
    }
    
    return result;
}

export default function parseOtherInline(
    line: string,
    wikiSlug: string,
    pageSlug: string,
    context: ExtendedContext,
    baseKey: number,
    designColor: designColor
): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let last = 0;

    const createArgs = (matchArr: RegExpExecArray, tokenStr: string, index: number): PluginArgs => ({
        token: tokenStr,
        key: `inl-${baseKey}-${index}`,
        match: matchArr,
        wikiSlug,
        pageSlug,
        context,
        baseKey,
        designColor
    });

    let lineAlignM: RegExpExecArray | null = null;
    if ((lineAlignM = INDIVIDUAL_REGEX.center.exec(line))) {
        return [renderers.renderAlign('center', createArgs(lineAlignM, lineAlignM[0], 0), parseOtherInline)];
    } else if ((lineAlignM = INDIVIDUAL_REGEX.left.exec(line))) {
        return [renderers.renderAlign('left', createArgs(lineAlignM, lineAlignM[0], 0), parseOtherInline)];
    } else if ((lineAlignM = INDIVIDUAL_REGEX.right.exec(line))) {
        return [renderers.renderAlign('right', createArgs(lineAlignM, lineAlignM[0], 0), parseOtherInline)];
    }
    
    const localTriggerRegex = new RegExp(PLUGIN_TRIGGER_REGEX.source, PLUGIN_TRIGGER_REGEX.flags);
    let m: RegExpExecArray | null;

    while ((m = localTriggerRegex.exec(line))) {
        const triggerIndex = m.index;

        if (triggerIndex > last) {
            nodes.push(line.slice(last, triggerIndex));
        }

        const remainingStr = line.slice(triggerIndex);
        let matchedToken: string | null = null;
        let matchedNode: React.ReactNode = null;
        let isContinueSkip = false;

        if (remainingStr.startsWith('#')) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.marquee.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderMarquee(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.calendar2.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderCalendar2(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.datedif.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderDateDif(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.datevalue.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderDateValue(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.comment.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderComment(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.rtcomment.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderRtComment(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.hr.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <hr key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.br.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <br key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.ls2.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLs2(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.ls.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLs(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.include.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderInclude(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.contents.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <TableOfContents key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.const.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderConst(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.let.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLet(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.func.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderFunc(createArgs(subM, subM[0], triggerIndex));
                isContinueSkip = true;
            }
        }
        else if (remainingStr.startsWith('&')) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.escape.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderEscape(createArgs(subM, subM[0], triggerIndex));
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.brAmp.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <br key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.size.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderSize(createArgs(subM, subM[0], triggerIndex), parseOtherInline);
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.color.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderColor(createArgs(subM, subM[0], triggerIndex), parseOtherInline);
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.attachref.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderAttachRef(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.constUse.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderConstUse(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.letUse.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLetUse(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.relet.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderRelet(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.calc.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderCalc(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.version.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderVersion(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.new.exec(remainingStr))) {
                matchedToken = subM[0];
                const newNode = renderers.renderNew(createArgs(subM, subM[0], triggerIndex));
                if (newNode) matchedNode = newNode;
            } else if ((subM = INDIVIDUAL_REGEX.arg.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderArg(createArgs(subM, subM[0], triggerIndex));
            } else if ((subM = INDIVIDUAL_REGEX.return.exec(remainingStr))) {
                let idx = 0;
                const parenStart = remainingStr.indexOf('(');
                const braceStart = remainingStr.indexOf('{');

                if (parenStart !== -1 && (braceStart === -1 || parenStart < braceStart) && parenStart < subM[0].length) {
                    idx = parenStart;
                    let parenDepth = 0;
                    while (idx < remainingStr.length) {
                        if (remainingStr[idx] === '(') parenDepth++;
                        else if (remainingStr[idx] === ')') {
                            parenDepth--;
                            if (parenDepth === 0) {
                                idx++;
                                if (remainingStr[idx] === ';') idx++;
                                break;
                            }
                        }
                        idx++;
                    }
                } 
                else if (braceStart !== -1 && braceStart < subM[0].length) {
                    idx = braceStart;
                    let braceDepth = 0;
                    while (idx < remainingStr.length) {
                        if (remainingStr[idx] === '{') braceDepth++;
                        else if (remainingStr[idx] === '}') {
                            braceDepth--;
                            if (braceDepth === 0) {
                                idx++;
                                if (remainingStr[idx] === ';') idx++;
                                break;
                            }
                        }
                        idx++;
                    }
                }

                const fullToken = idx > 0 ? remainingStr.slice(0, idx) : subM[0];
                matchedToken = fullToken;
                matchedNode = renderers.renderReturn(createArgs(subM, fullToken, triggerIndex), parseOtherInline);
                isContinueSkip = true;
            }
        }
        else if (remainingStr.startsWith('[[')) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.link.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLink(createArgs(subM, subM[0], triggerIndex), parseOtherInline);
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.plainLink.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLink(createArgs(subM, subM[0], triggerIndex), parseOtherInline);
                isContinueSkip = true;
            }
        }

        if (matchedToken) {
            if (matchedNode) nodes.push(matchedNode);
            last = triggerIndex + matchedToken.length;
            localTriggerRegex.lastIndex = last;

            if (isContinueSkip) {
                continue;
            }
        } else {
            localTriggerRegex.lastIndex = triggerIndex + 1;
        }
    }

    if (last < line.length) {
        const rest = line.slice(last).trim();
        if (rest && rest !== '};' && rest !== ';') {
            const cleaned = rest.replace(/^};+|^;+|};+$|;+$/g, '').trim();
            if (cleaned) {
                const splitByEscapedNewline = cleaned.split(/\\n/);
                
                for (let i = 0; i < splitByEscapedNewline.length; i++) {
                    if (splitByEscapedNewline[i]) nodes.push(splitByEscapedNewline[i]);
                    if (i < splitByEscapedNewline.length - 1) {
                        nodes.push(<br key={`${baseKey}-br-${last}-${i}`} />);
                    }
                }
            }
        }
    }

    return nodes;
}