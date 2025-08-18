export interface Context {
    wikiSlug: string;
    pageSlug: string;
    letContext?: Record<string, string>;
    variables: Record<string, string>;
}

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
    isOpen?: boolean;
    start?: number;
    end?: number;
    children?: FoldBlock[];
}

export type Token =
    | { type: 'text'; content: string }
    | { type: 'open'; title: string; level: '*' | '**' | '***'; isOpen: boolean }
    | { type: 'close' }
    | { type: 'export'; scope: 'global' | 'local'; variables: string[] }
    | { type: 'import'; slug: string; page: string; variables: string[] };
export type ASTNode =
    | { type: 'text'; content: string }
    | { type: 'accordion'; title: string; level: '*' | '**' | '***'; isOpen: boolean; children: ASTNode[] }
    | { type: 'export'; scope: 'global' | 'local'; variables: string[]; children: ASTNode[] }
    | { type: 'import'; slug: string; page: string; variables: string[]; children: ASTNode[] };
