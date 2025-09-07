import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person as PersonIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = login(username, password);
        
        if (!result.success) {
            setError(result.error);
        }
        
        setLoading(false);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #2D1B69 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Efeitos de fundo místicos */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                zIndex: 0
            }} />

            <Container maxWidth="sm" sx={{ zIndex: 1 }}>
                <Card sx={{
                    background: 'rgba(15, 15, 15, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Logo da Guilda */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h3" sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}>
                                👻 BANSHEE
                            </Typography>
                            <Typography variant="h6" sx={{
                                color: '#A78BFA',
                                fontStyle: 'italic',
                                mb: 1
                            }}>
                                Guilda Mística
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: '#B8B8B8',
                                maxWidth: 300,
                                mx: 'auto'
                            }}>
                                Acesso restrito aos membros da guilda. Entre com suas credenciais místicas para acessar os poderes do bot.
                            </Typography>
                        </Box>

                        {/* Formulário de Login */}
                        <Box component="form" onSubmit={handleSubmit}>
                            {error && (
                                <Alert severity="error" sx={{ 
                                    mb: 3,
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#FCA5A5',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Nome de Usuário"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: '#8B5CF6' }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(139, 92, 246, 0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(139, 92, 246, 0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#8B5CF6',
                                        },
                                        color: '#FFFFFF'
                                    }
                                }}
                                InputLabelProps={{
                                    sx: { color: '#B8B8B8' }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Senha"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 4 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#8B5CF6' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePasswordVisibility}
                                                edge="end"
                                                sx={{ color: '#B8B8B8' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(139, 92, 246, 0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(139, 92, 246, 0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#8B5CF6',
                                        },
                                        color: '#FFFFFF'
                                    }
                                }}
                                InputLabelProps={{
                                    sx: { color: '#B8B8B8' }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(139, 92, 246, 0.3)',
                                        color: 'rgba(255, 255, 255, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loading ? 'Invocando Espíritos...' : '🔮 Entrar na Guilda'}
                            </Button>
                        </Box>

                        {/* Dica de credenciais para desenvolvimento */}
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ 
                                color: 'rgba(184, 184, 184, 0.6)',
                                fontStyle: 'italic'
                            }}>
                                ⚡ Apenas membros autorizados da Guilda Banshee
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default LoginPage;
