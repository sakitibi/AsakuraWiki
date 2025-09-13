import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("https://13ninaccounts.vercel.app/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Login failed");
            }

            const { token } = await res.json();
            localStorage.setItem("auth_token", token);

            // ログイン後にプロフィール取得
            const profileRes = await fetch("https://13ninaccounts.vercel.app/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const profile = await profileRes.json();
            setUser(profile);
        } catch (err: any) {
            setError(err.message);
        }
    }

    if (user) {
        return <p>ようこそ {user.email} さん！</p>;
    }

    return (
        <>
            <main style={{ padding: "2rem" }}>
                <h1>ログイン</h1>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px" }}>
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                    <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                    <button type="submit">ログイン</button>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </main>
        </>
    );
}
