import React from 'react';
import PageLoader from '../UI/PageLoader.jsx';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Box,
    CircularProgress,
    Chip,
    Grid,
    Divider,
    IconButton
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    PowerSettingsNew as PowerIcon,
    Stop as StopIcon
} from '@mui/icons-material';

const BotStatusPage = ({ botStatus, fetchBotStatus, startBot, stopBot, loading, setMessage }) => {
    const handleBotAction = async (action, actionName) => {
        try {
            const result = await action();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Erro ao ${actionName.toLowerCase()} o bot` });
        }
    };

    const isOnline = botStatus?.status?.clientReady;
    const botUser = botStatus?.status?.botUser;
    
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 4
            }}>
                Status da Banshee
            </Typography>
            
            <Card sx={{ 
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
            }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                            Status do Bot Banshee
                        </Typography>
                        <IconButton
                            onClick={fetchBotStatus}
                            disabled={loading}
                            sx={{ 
                                color: '#8B5CF6',
                                '&:hover': {
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                },
                                '&:disabled': {
                                    color: 'rgba(139, 92, 246, 0.3)'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={20} sx={{ color: '#8B5CF6' }} /> : <RefreshIcon />}
                        </IconButton>
                    </Box>
                    
                    {botStatus ? (
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                {isOnline ? (
                                    <CheckIcon sx={{ color: '#10B981' }} />
                                ) : (
                                    <ErrorIcon sx={{ color: '#EF4444' }} />
                                )}
                                <Chip 
                                    label={isOnline ? 'Online' : 'Offline'}
                                    sx={{
                                        backgroundColor: isOnline ? '#10B981' : '#EF4444',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>
                            
                            {botUser && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Espírito Conectado: {botUser.tag || botUser.username}
                                </Typography>
                            )}
                            
                            {botStatus.status?.uptime && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Tempo Ativo: {Math.floor(botStatus.status.uptime / 60)} min
                                </Typography>
                            )}
                            
                            {botStatus.status?.ping && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Latência: {botStatus.status.ping}ms
                                </Typography>
                            )}
                            
                            <Typography variant="body2" color="text.secondary">
                                Última Manifestação: {new Date(botStatus.status?.timestamp || Date.now()).toLocaleTimeString()}
                            </Typography>

                            <Divider sx={{ my: 3, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<PowerIcon />}
                                        onClick={() => handleBotAction(startBot, 'Ligar')}
                                        disabled={loading || isOnline}
                                        sx={{ 
                                            backgroundColor: '#10B981',
                                            '&:hover': { backgroundColor: '#059669' },
                                            '&:disabled': { backgroundColor: 'rgba(16, 185, 129, 0.3)' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Ligar'}
                                    </Button>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<StopIcon />}
                                        onClick={() => handleBotAction(stopBot, 'Desligar')}
                                        disabled={loading || !isOnline}
                                        sx={{ 
                                            backgroundColor: '#EF4444',
                                            '&:hover': { backgroundColor: '#DC2626' },
                                            '&:disabled': { backgroundColor: 'rgba(239, 68, 68, 0.3)' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Desligar'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box display="flex" alignItems="center" gap={2}>
                            <CircularProgress sx={{ color: '#8B5CF6' }} />
                            <Typography color="text.secondary">Invocando espírito...</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default BotStatusPage;
