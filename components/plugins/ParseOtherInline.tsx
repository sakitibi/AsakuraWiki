import React from 'react';
import { designColor } from "@/utils/wiki_settings";
import TableOfContents from '@/components/plugins/TableOfContents';
import { PLUGIN_REGEX } from '@/components/plugins/ParseOtherInline/regex';
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
    let last: number = 0;
    let m: RegExpExecArray | null;

    // 正規表現のインスタンスのインデックスを初期化
    PLUGIN_REGEX.lastIndex = 0;

    while ((m = PLUGIN_REGEX.exec(line))) {
        const token: string = m[0];
        const key: string = `inl-${baseKey}-${m.index}`;

        // プレーンテキスト部分の処理
        if (m.index > last) {
            nodes.push(line.slice(last, m.index));
        }

        // 引数オブジェクトの集約
        const pluginArgs: PluginArgs = {
            token, key, match: m, wikiSlug, pageSlug, context, baseKey, designColor
        };

        // --- 各プラグインの判定分岐 ---
        if (token.startsWith('#marquee')) {
            nodes.push(renderers.renderMarquee(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('&escape(')) {
            nodes.push(renderers.renderEscape(pluginArgs));
            last = m.index + token.length;
            continue; // 原型通り、特定プラグインのみ continue でスキップ制御
        } 
        else if (token.startsWith('#calendar2')) {
            nodes.push(renderers.renderCalendar2(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('#DATEDIF')) {
            nodes.push(renderers.renderDateDif(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('#DATEVALUE')) {
            nodes.push(renderers.renderDateValue(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('#comment')) {
            nodes.push(renderers.renderComment(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('#rtcomment')) {
            nodes.push(renderers.renderRtComment(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token === '#hr') {
            nodes.push(<hr key={key} />);
            last = m.index + token.length;
        } 
        else if (token.startsWith('#br') || token.startsWith('&br;')) {
            nodes.push(<br key={key} />);
            last = m.index + token.length;
        } 
        else if (token.startsWith('#ls2')) { // #ls より先に判定
            nodes.push(renderers.renderLs2(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('#ls')) {
            nodes.push(renderers.renderLs(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('#include')) {
            nodes.push(renderers.renderInclude(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token === '#contents') {
            nodes.push(<TableOfContents key={key} />);
            last = m.index + token.length;
        } 
        else if (m[14]) {
            nodes.push(renderers.renderAlign('center', pluginArgs, parseOtherInline));
            last = m.index + token.length;
        } 
        else if (m[15]) {
            nodes.push(renderers.renderAlign('left', pluginArgs, parseOtherInline));
            last = m.index + token.length;
        } 
        else if (m[16]) {
            nodes.push(renderers.renderAlign('right', pluginArgs, parseOtherInline));
            last = m.index + token.length;
        } 
        else if (token.startsWith('&size(')) {
            nodes.push(renderers.renderSize(pluginArgs, parseOtherInline));
            last = m.index + token.length;
            continue;
        } 
        else if (token.startsWith('&color(')) {
            nodes.push(renderers.renderColor(pluginArgs, parseOtherInline));
            last = m.index + token.length;
            continue;
        } 
        else if (token.startsWith('[[')) {
            nodes.push(renderers.renderLink(pluginArgs, parseOtherInline));
            last = m.index + token.length;
            continue;
        } 
        else if (token.startsWith('&attachref(')) {
            nodes.push(renderers.renderAttachRef(pluginArgs));
            last = m.index + token.length;
        } 
        else if (m[35] && m[36] && m[37]) {
            nodes.push(renderers.renderConst(pluginArgs));
            last = m.index + token.length;
        } 
        else if (m[38] && m[39] && m[40]) {
            nodes.push(renderers.renderLet(pluginArgs));
            last = m.index + token.length;
        } 
        else if (m[41]) {
            nodes.push(renderers.renderConstUse(pluginArgs));
            last = m.index + token.length;
        } 
        else if (m[42]) {
            nodes.push(renderers.renderLetUse(pluginArgs));
            last = m.index + token.length;
        } 
        else if (m[43]) {
            nodes.push(renderers.renderRelet(pluginArgs));
            last = m.index + token.length;
        } 
        else if (m[44]) {
            nodes.push(renderers.renderCalc(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('&version(')) {
            nodes.push(renderers.renderVersion(pluginArgs));
            last = m.index + token.length;
        } 
        else if (token.startsWith('&new')) {
            const newNode = renderers.renderNew(pluginArgs);
            if (newNode) nodes.push(newNode);
            last = m.index + token.length;
        } 
        else if (m[48]) {
            nodes.push(renderers.renderFunctionCall(pluginArgs));
            last = m.index + token.length;
        }
    }

    // 後続テキストのクリーンアップ処理
    if (last < line.length) {
        const rest = line.slice(last).trim();
        const cleaned = rest.replace(/^};+$/, '');
        const splitByEscapedNewline = cleaned.split(/\\n/);
        
        for (let i = 0; i < splitByEscapedNewline.length; i++) {
            if (splitByEscapedNewline[i]) {
                nodes.push(splitByEscapedNewline[i]);
            }
            if (i < splitByEscapedNewline.length - 1) {
                nodes.push(<br key={`${baseKey}-br-${last}-${i}`} />);
            }
        }
    }

    return nodes;
}