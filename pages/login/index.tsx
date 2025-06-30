import Link from 'next/link';

export default function LoginPage() {
    return (
        <main style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
            <h1>🔐 ログイン</h1>
            <p>ログイン方法を選択してください：</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <Link href="/login/github">
                    <button style={buttonStyle}><span>GitHubでログイン</span></button>
                </Link>
                <Link href="/login/email">
                    <button style={buttonStyle}><span>13ninアカウントでログイン</span></button>
                </Link>
            </div>
        </main>
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