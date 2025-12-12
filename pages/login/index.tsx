import Head from 'next/head';
import Link from 'next/link';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>あさクラWikiにログイン</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
                <h1>
                    <i
                        className="fa-solid fa-key"
                        style={{ fontSize: 'inherit' }}
                    ></i>
                    ログイン
                </h1>
                <p>ログイン方法を選択してください：</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <Link href="/login/13nin/">
                        <button style={buttonStyle}><span>13ninアカウントでログイン</span></button>
                    </Link>
                    <Link href="/login/13nin/secretcodes">
                        <button style={buttonStyle}><span>あさクラシークレットコードでログイン</span></button>
                    </Link>
                    <Link href="/login/github">
                        <button style={buttonStyle}><span>GitHubでログイン</span></button>
                    </Link>
                    <Link href="/login/gitlab">
                        <button style={buttonStyle}><span>GitLabでログイン</span></button>
                    </Link>
                    <Link href="/login/bitbucket">
                        <button style={buttonStyle}><span>BitBucketでログイン</span></button>
                    </Link>
                    <Link href="/login/discord">
                        <button style={buttonStyle}><span>Discordでログイン</span></button>
                    </Link>
                </div>
            </main>
            <FooterJp/>
        </>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
};