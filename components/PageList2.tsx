interface PageList2Props {
    /** パターン（接頭辞） */
    pattern?: string
    /** title, include, reverse, compact, link などのオプション */
    options?: string[]
    /** link オプションで表示するテキスト */
    label?: string
}

export default function PageList2({ pattern, options, label }: PageList2Props) {
    // TODO:
    //  - pattern で filter
    //  - options によって API 取得内容／並び順を切替
    //  - link オプション時は一覧ではなくリンクを出力
    return <div>ls2 plugin: 実装中…</div>
}