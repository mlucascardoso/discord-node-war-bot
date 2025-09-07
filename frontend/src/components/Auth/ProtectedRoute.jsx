import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from '../Pages/LoginPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #2D1B69 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3
            }}>
                <CircularProgress 
                    size={60} 
                    sx={{ 
                        color: '#8B5CF6',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }} 
                />
                <Typography variant="h6" sx={{
                    color: '#A78BFA',
                    fontWeight: 500,
                    textAlign: 'center'
                }}>
                    👻 Invocando Espíritos da Guilda...
                </Typography>
                <Typography variant="body2" sx={{
                    color: '#B8B8B8',
                    fontStyle: 'italic',
                    textAlign: 'center'
                }}>
                    Verificando permissões místicas
                </Typography>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return children;
};

export default ProtectedRoute;
