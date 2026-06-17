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

    // ループごとに新しく正規表現の探索位置を制御（再帰セーフにするため、毎回初期化するか独立させる）
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

        // 共通引数オブジェクトのビルダー（マッチした時だけ生成して軽量化）
        const createArgs = (matchArr: RegExpExecArray, tokenStr: string): PluginArgs => ({
            token: tokenStr,
            key: `inl-${baseKey}-${triggerIndex}`,
            match: matchArr,
            wikiSlug,
            pageSlug,
            context,
            baseKey,
            designColor
        });

        // --- 1. # から始まるプラグインの判定 ---
        if (remainingStr.startsWith('#')) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.marquee.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderMarquee(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.calendar2.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderCalendar2(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.datedif.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderDateDif(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.datevalue.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderDateValue(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.comment.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderComment(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.rtcomment.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderRtComment(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.hr.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <hr key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.br.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <br key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.ls2.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLs2(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.ls.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLs(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.include.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderInclude(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.contents.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <TableOfContents key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.const.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderConst(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.let.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLet(createArgs(subM, subM[0]));
            }
        }
        // --- 2. & から始まるプラグインの判定 ---
        else if (remainingStr.startsWith('&')) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.escape.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderEscape(createArgs(subM, subM[0]));
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.brAmp.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = <br key={`inl-${baseKey}-${triggerIndex}`} />;
            } else if ((subM = INDIVIDUAL_REGEX.size.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderSize(createArgs(subM, subM[0]), parseOtherInline);
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.color.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderColor(createArgs(subM, subM[0]), parseOtherInline);
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.attachref.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderAttachRef(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.constUse.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderConstUse(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.letUse.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLetUse(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.relet.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderRelet(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.calc.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderCalc(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.version.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderVersion(createArgs(subM, subM[0]));
            } else if ((subM = INDIVIDUAL_REGEX.new.exec(remainingStr))) {
                matchedToken = subM[0];
                const newNode = renderers.renderNew(createArgs(subM, subM[0]));
                if (newNode) matchedNode = newNode;
            } else if ((subM = INDIVIDUAL_REGEX.functionCall.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderFunctionCall(createArgs(subM, subM[0]));
            }
        }
        // --- 3. [[ から始まるリンクの判定 ---
        else if (remainingStr.startsWith('[[')) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.link.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLink(createArgs(subM, subM[0]), parseOtherInline);
                isContinueSkip = true;
            } else if ((subM = INDIVIDUAL_REGEX.plainLink.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderLink(createArgs(subM, subM[0]), parseOtherInline);
                isContinueSkip = true;
            }
        }

        // 行頭専用（CENTER: など）のフォールバック
        if (!matchedToken && triggerIndex === 0) {
            let subM: RegExpExecArray | null;
            if ((subM = INDIVIDUAL_REGEX.center.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderAlign('center', createArgs(subM, subM[0]), parseOtherInline);
            } else if ((subM = INDIVIDUAL_REGEX.left.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderAlign('left', createArgs(subM, subM[0]), parseOtherInline);
            } else if ((subM = INDIVIDUAL_REGEX.right.exec(remainingStr))) {
                matchedToken = subM[0];
                matchedNode = renderers.renderAlign('right', createArgs(subM, subM[0]), parseOtherInline);
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
            // 単なる「#」や「&」の文字だった場合は、無限ループ防止のためポインタを1進める
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