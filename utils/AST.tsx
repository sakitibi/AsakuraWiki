import React from 'react';
import Accordion from '@/components/plugins/Accordion';
import parseInline from '@/components/plugins/ParseInline';
import { Context, ASTNode } from '@/components/plugins/parsePluginTypes';
import ExportBlock from '@/components/plugins/ExportBlock';
import ImportBlock from '@/components/plugins/ImportBlock';
import Fold from '@/components/plugins/Fold';
import styles from '@/css/wikis.min.module.css';
import { tokenize } from '@/utils/parsePlugins';

export function buildAST(src: string, context: Context): ASTNode[] {
    const tokens = tokenize(src);
    const root: ASTNode[] = [];
    const stack: ASTNode[][] = [root];

    for (const tk of tokens) {
        const curr = stack[stack.length - 1];
        if (tk.type === 'text') {
            const last = curr[curr.length - 1];
            if (last?.type === 'text') {
                last.content += tk.content;
            } else {
                curr.push({ type: 'text', content: tk.content });
            }
        }
        else if (tk.type === 'open') {
            const node: ASTNode = {
                type: 'accordion',
                title: tk.title,
                level: tk.level ?? "*",
                isOpen: tk.isOpen,
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
        else if (tk.type === 'close') {
            if (stack.length > 1) stack.pop();
        }
        else if (tk.type === 'openFolds') {
            const node: ASTNode = {
                type: 'fold',
                title: tk.title,
                isOpen: tk.isOpen,
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
        else if (tk.type === 'closeFolds') {
            if (stack.length > 1) stack.pop();
        }
        else if (tk.type === 'export') {
            const node: ASTNode = {
                type: 'export',
                scope: tk.scope,
                variables: tk.variables,
            };
            curr.push(node);
        }
        else if (tk.type === 'import') {
            const node: ASTNode = {
                type: 'import',
                slug: tk.slug,
                page: tk.page,
                variables: tk.variables,
            };
            curr.push(node);
        }
        else if (tk.type === 'function') {
            const node: ASTNode = {
                type: 'function',
                name: tk.name,
                args: tk.args,
                body: tk.body,
                returnValue: tk.returnValue
            };
            curr.push(node);

            // 関数定義を context に保存
            if (!context.functions) context.functions = {};
            context.functions[tk.name] = {
                args: tk.args,
                returnValue: tk.returnValue,
                body: tk.body
            };
        }
    }
    return root;
}

export function renderAST(
    nodes: ASTNode[],
    context: Context
): React.ReactNode[] {
    return nodes.map((node, idx) => {
        if (node.type === 'text') {
            return (
                <React.Fragment key={`t${idx}`}>
                    {parseInline({text: node.content, context})}
                </React.Fragment>
            );
        }

        if (node.type === 'accordion') {
            return (
                <Accordion
                    key={`a${idx}`}
                    title={node.title}
                    level={node.level}
                    initiallyOpen={node.isOpen}
                >
                    {renderAST(node.children, context)}
                </Accordion>
            );
        }
        else if (node.type === 'fold') {
            return (
                <Fold
                    key={`f${idx}`}
                    title={node.title}
                    initiallyOpen={node.isOpen}
                >
                    {renderAST(node.children, context)}
                </Fold>
            );
        }
        else if (node.type === 'export') {
            return (
                <ExportBlock
                    key={`e${idx}`}
                    scope={node.scope}
                    variables={node.variables}
                >
                </ExportBlock>
            );
        }

        else if (node.type === 'import') {
            return (
                <ImportBlock
                    key={`i${idx}`}
                    slug={node.slug}
                    page={node.page}
                    variables={node.variables}
                >
                </ImportBlock>
            );
        }
        else if (node.type === 'function') {
            return (
                <div key={`fd${idx}`} className={styles.functionBlock}>
                    <strong>Function: {node.name}</strong>
                    <div>Args: {node.args.join(', ')}</div>
                    <pre>{node.body}</pre>
                    <div>Return: {node.returnValue}</div>
                </div>
            );
        }
        // 他のノード型は無視するか、別途処理
        return null;
    });
}