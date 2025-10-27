import { useEffect, useState } from 'react';
import { parseWikiContent } from '@/utils/parsePlugins';
import type { Context } from '@/components/parsePluginTypes';
import styles from '@/css/wikis.min.module.css'; // ← 適宜調整

interface FunctionCallRendererProps{
    name: string;
    args: string[];
    context: Context;
}

export default function FunctionCallRenderer({ name, args, context }: FunctionCallRendererProps) {
    const [result, setResult] = useState<React.ReactNode>('...');

    useEffect(() => {
        const func = context.functions?.[name];
        if (!func) {
            setResult(<span>⚠️ 未定義の関数: {name}</span>);
            return;
        }

        const argMap = Object.fromEntries((func.args ?? []).map((argName, i) => [argName, args[i] ?? '']));

        // #return の内容を抽出（なければ body 全体を使う）
        const returnMatch = func.body.match(/#return\s*(.*)/);
        const returnExpr = returnMatch ? returnMatch[1].trim() : func.body;

        const rendered = returnExpr.replace(/{{\s*(\w+)\s*}}/g, (_, key) => argMap[key] ?? '');

        parseWikiContent(rendered, context).then(res => {
            setResult(<>{res}</>);
        });
    }, [name, args, context]);

    return (
        <div className={styles.functionCall}>
            <strong>{name}:</strong> {result}
        </div>
    );
}
