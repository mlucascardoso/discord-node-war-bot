import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Credenciais da Guilda Banshee
    const BANSHEE_CREDENTIALS = {
        username: 'bansheeAdmin',
        password: 'bansheeAdmin@07092025'
    };

    useEffect(() => {
        // Verificar se há sessão salva no localStorage
        const savedAuth = localStorage.getItem('banshee_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            // Verificar se a sessão ainda é válida (24 horas)
            const now = new Date().getTime();
            if (now - authData.timestamp < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('banshee_auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (username, password) => {
        if (username === BANSHEE_CREDENTIALS.username && password === BANSHEE_CREDENTIALS.password) {
            setIsAuthenticated(true);
            // Salvar sessão no localStorage
            const authData = {
                authenticated: true,
                timestamp: new Date().getTime(),
                user: username
            };
            localStorage.setItem('banshee_auth', JSON.stringify(authData));
            return { success: true };
        } else {
            return { 
                success: false, 
                error: 'Credenciais inválidas. Apenas membros da Guilda Banshee têm acesso!' 
            };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('banshee_auth');
    };

    const value = {
        isAuthenticated,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
