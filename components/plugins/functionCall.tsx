import { useEffect, useState } from 'react';
import { parseWikiContent } from '@/utils/parsePlugins';
import type { Context } from '@/components/plugins/parsePluginTypes';
import { designColor } from '@/utils/wiki_settings';

interface FunctionCallRendererProps{
    name: string;
    args: string[];
    context: Context;
    designColor: designColor
}

export default function FunctionCallRenderer({ name, args, context, designColor }: FunctionCallRendererProps) {
    const [result, setResult] = useState<React.ReactNode>('...');
    useEffect(() => {
        console.log('[FunctionCallRenderer] 呼び出し:', { name, args });

        const func = context.functions?.[name];
        console.log('[FunctionCallRenderer] 関数定義:', func);

        if (!func) {
            setResult(<span>⚠️ 未定義の関数: {name}</span>);
            return;
        }

        const argMap = Object.fromEntries((func.args ?? []).map((argName, i) => [argName, args[i] ?? '']));
        console.log('[FunctionCallRenderer] 引数マップ:', argMap);

        const returnMatch = func.body.match(/#return\s*(.*)/);
        const returnExpr = returnMatch ? returnMatch[1].trim() : func.body;
        console.log('[FunctionCallRenderer] 描画対象の returnExpr:', returnExpr);

        const rendered = returnExpr.replace(/{{\s*(\w+)\s*}}/g, (_, key) => argMap[key] ?? '');
        console.log('[FunctionCallRenderer] テンプレート置換後:', rendered);

        parseWikiContent(rendered, context, designColor).then(res => {
            console.log('[FunctionCallRenderer] 最終描画結果:', res);
            setResult(<>{res}</>);
        });
    }, [name, args, context]);
    return (
        <div className="functionCall">
            <strong>{name}:</strong> {result}
        </div>
    );
}
