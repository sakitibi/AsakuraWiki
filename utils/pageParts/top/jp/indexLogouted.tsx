export default function LogoutedUI(){
    return(
        <>
            <h1>あさクラWikiへようこそ!</h1>
            <div className="text-dark">
                <strong className="masthead-notice rounded-3 p-2">あさクラWikiの新機能</strong>
                <h2>newプラグイン</h2>
                <p>インライン型プラグイン</p>
            </div>
            <h2 className="mb-3 fw-semibold lh-1">あさクラWikiのたくさんの機能で<br/>自分だけのWikiを作成しよう。</h2>
            <p className="lead mb-4">
                <strong className="text-brand block md:ml-0">パワフルで拡張性の高い、機能満載のレンタルWikiサービスです。</strong><br/>
                <span className="block text-foreground">askrEditorでビルドしてカスタマイズし、あらかじめ用意されたグリッドシステムとコンポーネントを利用し、</span><br/>
                魔法のように強力なWikiオリジナルプラグインで<strong className="text-brand block md:ml-0">Wikiに命を吹き込むことができます。</strong>
            </p>
            <div className="flex items-center gap-2">
                <a
                    className="relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border bg-brand-400 dark:bg-brand-500 hover:bg-brand/80 dark:hover:bg-brand/50 text-foreground border-brand-500/75 dark:border-brand/30 hover:border-brand-600 dark:hover:border-brand focus-visible:outline-brand-600 data-[state=open]:bg-brand-400/80 dark:data-[state=open]:bg-brand-500/80 data-[state=open]:outline-brand-600 text-sm px-4 py-2 h-[38px]"
                    href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69"
                >
                    <span className="truncate">13ninアカウントを新規作成</span>
                </a>
            </div>
        </>
    )
}