import { NextPageContext } from 'next';

type ErrorProps = {
    statusCode?: number;
};

function Error({ statusCode }: ErrorProps) {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>
            {statusCode
            ? `${statusCode} エラー`
            : '予期しないエラーが発生しました'}
        </h1>
            {statusCode === 500 && <p>サーバーエラーが発生しています、</p>}
            {statusCode === 403 && <p>アクセスが拒否されました。</p>}
            {statusCode === 401 && <p>認証が必要です。</p>}
            {statusCode === 503 && <p>現在メンテナンス中です。</p>}
        </div>
    );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
    return { statusCode };
};

export default Error;