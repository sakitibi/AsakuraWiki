import dynamic from 'next/dynamic';
import { getServerSideProps as wikiGetServerSideProps } from '@/utils/wikiGetServerSideProps'; // 後述の SSR 処理を外部化
import type { WikiPageProps } from "@/components/wiki/WikiPageInner";

// CSR 用コンポーネントを動的 import
const WikiPageInner = dynamic<WikiPageProps>(
    () => import('@/components/wiki/WikiPageInner.js').then(
      (mod) => mod.default // ← default を取り出す
    ),
    { ssr: false }
);

export { wikiGetServerSideProps as getServerSideProps };
export default function WikiPage(props: any) {
    return <WikiPageInner {...props} />;
}
