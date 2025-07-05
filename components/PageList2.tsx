export interface PageList2Props {
    wikiSlug: string
    pattern: string
    options?: string[]
    label?: string
}

export default function PageList2({
    wikiSlug,
    pattern,
    options,
    label,
    }: PageList2Props) {
    // …ここに ls2 のロジック…
    return <div>ls2: {pattern} [{options?.join(',')}] {label}</div>
}