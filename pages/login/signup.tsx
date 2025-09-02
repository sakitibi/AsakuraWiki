import { useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { notuseUsername } from '@/utils/user_list';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const notuseUser_list_found = notuseUsername.find(value => value === username);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if(notuseUser_list_found){
            setErrorMsg('このユーザー名は使用出来ません、');
            setLoading(false);
            return;
        }

        const { data, error } = await supabaseServer.auth.signUp({
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
                    <a href="/policies">あさクラWiki利用規約</a>に同意
                    <input 
                        type="checkbox"
                        required
                    />
                </label>
                <br /><br />
                <label>
                    <a href="https://sakitibi-com9.webnode.jp/page/10">13nin利用規約</a>に同意
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