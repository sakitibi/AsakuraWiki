import { NextPage } from 'next';

interface ErrorProps {
    statusCode?: number;
};

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>{statusCode ? `${statusCode} エラー` : '予期しないエラーが発生しました'}</h1>
            {statusCode === 500 && <p>サーバーエラーが発生しています。</p>}
            {statusCode === 403 && <p>アクセスが拒否されました。</p>}
            {statusCode === 401 && <p>認証が必要です。</p>}
            {statusCode === 503 && <p>現在メンテナンス中です。</p>}
        </div>
    );
};

export default ErrorPage;