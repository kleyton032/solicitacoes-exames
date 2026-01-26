import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn({ email, hash: password });
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--primary-color)' }}>
                    Acesse sua conta
                </h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Bem-vindo de volta
                </p>

                <form onSubmit={handleLogin} className="flex flex-col gap-md">
                    {error && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col" style={{ gap: '0.375rem' }}>
                        <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '500' }}>E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', transition: 'border-color 200ms' }}
                            required
                        />
                    </div>

                    <div className="flex flex-col" style={{ gap: '0.375rem' }}>
                        <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background-color 200ms'
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
