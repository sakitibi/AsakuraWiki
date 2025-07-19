import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username  // ここが user_metadata に保存される
                }
            }
        });

        if (error || !data.user) {
            setErrorMsg(error?.message || '登録失敗');
            setLoading(false);
            return;
        }

        setLoading(false);
        window.location.href = '/dashboard';
    };

    return (
        <main style={{ padding: '2rem', maxWidth: 500 }}>
            <h1>📝 新規登録</h1>
            <form onSubmit={handleSignUp}>
                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                />
                <br /><br />
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                />
                <br /><br />
                <input
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                />
                <br /><br />
                <label>
                    <a href="https://sakitibi-com9.webnode.jp/page/9">利用規約</a>に同意
                    <input 
                        type="checkbox"
                        required
                    />
                </label>
                <br/><br/>
                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                <button type="submit" disabled={loading}>
                    <span>
                        {loading ? '登録中…' : '新規登録'}
                    </span>
                </button>
            </form>
        </main>
    );
}