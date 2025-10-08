export type Context = {
    wikiSlug: string;
    pageSlug: string;
    variables: Record<string, string>;
    constContext?: Record<string, string>; // ← 追加
    letContext?: Record<string, string>;   // ← 追加
};

export interface AccordionBlock {
    prefix?: string;
    title?: string;
    level?: '*' | '**' | '***';
    isOpen?: boolean;
    body?: string;
    bodyNode?: React.ReactNode[];
    start?: number;
    end?: number;
    children?: AccordionBlock[]; // 子ブロックのためのプロパティ
}

export interface FoldBlock {
    prefix: string;
    title?: React.ReactNode;
    body?: string;
    bodyNode: React.ReactNode[];
    isOpen?: boolean;
    start?: number;
    end?: number;
    children?: FoldBlock[];
}

export interface ImportBlockProps{
    slug: string;
    page: string;
    variables: string[];
}

export interface injectConstBlocksProps{
    name: string;
    value: string;
    type: string;
    kind: string
}

export type Token =
    | { type: 'text'; content: string }
    | { type: 'open' | 'openFolds'; title: string; level?: '*' | '**' | '***'; isOpen: boolean }
    | { type: 'close' | 'closeFolds' }
    | { type: 'export'; scope: 'global' | 'local'; variables: string[] }
    | { type: 'import'; slug: string; page: string; variables: string[] };
export type ASTNode =
    | { type: 'text'; content: string }
    | { type: 'accordion'; title: string; level: '*' | '**' | '***'; isOpen: boolean; children: ASTNode[] }
    | { type: 'fold'; title: string; isOpen: boolean; children: ASTNode[] }
    | { type: 'export'; scope: 'global' | 'local'; variables: string[]; }
    | { type: 'import'; slug: string; page: string; variables: string[]; };
