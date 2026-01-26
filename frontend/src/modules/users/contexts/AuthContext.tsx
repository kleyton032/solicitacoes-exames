import { createContext, useCallback, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { api } from '../../../shared/infra/http/api';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    token: string;
    user: User;
}

interface SignInCredentials {
    email: string;
    hash: string;
}

interface AuthContextData {
    user: User;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AuthState>(() => {
        const token = localStorage.getItem('@Solicitacoes:token');
        const user = localStorage.getItem('@Solicitacoes:user');

        if (token && user) {
            return { token, user: JSON.parse(user) };
        }

        return {} as AuthState;
    });

    const signIn = useCallback(async ({ email, hash }: SignInCredentials) => {
        const response = await api.post('/sessions', {
            email,
            password: hash,
        });

        const { token, user } = response;

        localStorage.setItem('@Solicitacoes:token', token);
        localStorage.setItem('@Solicitacoes:user', JSON.stringify(user));

        setData({ token, user });
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem('@Solicitacoes:token');
        localStorage.removeItem('@Solicitacoes:user');

        setData({} as AuthState);
    }, []);

    return (
        <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
