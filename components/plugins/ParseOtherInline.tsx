import React from 'react';
import { designColor } from "@/utils/wiki_settings";
import TableOfContents from '@/components/plugins/TableOfContents';
import { PLUGIN_TRIGGER_REGEX, INDIVIDUAL_REGEX } from '@/components/plugins/ParseOtherInline/regex';
import { ExtendedContext, PluginArgs } from '@/components/plugins/ParseOtherInline/types';
import * as renderers from '@/components/plugins/ParseOtherInline/pluginRenderers';

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
    // 再帰（入れ子）呼び出しに耐えられるよう、ループごとに独立した正規表現インスタンスを使用
    const localTriggerRegex = new RegExp(PLUGIN_TRIGGER_REGEX.source, PLUGIN_TRIGGER_REGEX.flags);
    let m: RegExpExecArray | null;

    while ((m = localTriggerRegex.exec(line))) {
        const triggerIndex = m.index;

        // トリガーの手前に未処理のテキストがあれば格納
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
                let idx = 0;
                let parenDepth = 0;
                let braceDepth = 0;
                const parenStart = remainingStr.indexOf('(');
                
                if (parenStart !== -1 && parenStart < subM[0].length) {
                    idx = parenStart;
                    // 関数の引数部分 () を正しくスキャン
                    while (idx < remainingStr.length) {
                        if (remainingStr[idx] === '(') parenDepth++;
                        else if (remainingStr[idx] === ')') {
                            parenDepth--;
                            if (parenDepth === 0) {
                                idx++;
                                break;
                            }
                        }
                        idx++;
                    }
                    // 関数の中身部分 {} を正しくスキャン
                    const braceStart = remainingStr.indexOf('{', idx);
                    if (braceStart !== -1) {
                        idx = braceStart;
                        while (idx < remainingStr.length) {
                            if (remainingStr[idx] === '{') braceDepth++;
                            else if (remainingStr[idx] === '}') {
                                braceDepth--;
                                if (braceDepth === 0) {
                                    idx++;
                                    if (remainingStr[idx] === ';') idx++; // 末尾のセミコロンも含める
                                    break;
                                }
                            }
                            idx++;
                        }
                    }
                }

                const fullToken = idx > 0 ? remainingStr.slice(0, idx) : subM[0];
                matchedToken = fullToken;
                matchedNode = renderers.renderFunc(createArgs(subM, fullToken, triggerIndex));
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
            
            // 探索ポインタを解析完了したプラグインの末尾までスキップ
            localTriggerRegex.lastIndex = last;

            if (isContinueSkip) {
                continue;
            }
        } else {
            localTriggerRegex.lastIndex = triggerIndex + 1;
        }
    }

    // 残りのテキスト処理
    if (last < line.length) {
        const rest = line.slice(last).trim();
        if (rest && rest !== '};') {
            const cleaned = rest.replace(/^};+$/, '');
            const splitByEscapedNewline = cleaned.split(/\\n/);
            
            for (let i = 0; i < splitByEscapedNewline.length; i++) {
                if (splitByEscapedNewline[i]) nodes.push(splitByEscapedNewline[i]);
                if (i < splitByEscapedNewline.length - 1) {
                    nodes.push(<br key={`${baseKey}-br-${last}-${i}`} />);
                }
            }
        }
    }

    return nodes;
}