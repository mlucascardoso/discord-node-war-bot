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
    Chip
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const BotStatusPage = ({ botStatus, fetchBotStatus }) => {
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
                    <Typography variant="h5" gutterBottom sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                        Status do Bot Banshee
                    </Typography>
                    
                    {botStatus ? (
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                {botStatus.botReady ? (
                                    <CheckIcon sx={{ color: '#10B981' }} />
                                ) : (
                                    <ErrorIcon sx={{ color: '#EF4444' }} />
                                )}
                                <Chip 
                                    label={botStatus.botReady ? 'Online' : 'Offline'}
                                    sx={{
                                        backgroundColor: botStatus.botReady ? '#10B981' : '#EF4444',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>
                            
                            {botStatus.botUser && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Espírito Conectado: {botStatus.botUser}
                                </Typography>
                            )}
                            
                            <Typography variant="body2" color="text.secondary">
                                Última Manifestação: {new Date(botStatus.timestamp).toLocaleTimeString()}
                            </Typography>
                        </Box>
                    ) : (
                        <Box display="flex" alignItems="center" gap={2}>
                            <CircularProgress sx={{ color: '#8B5CF6' }} />
                            <Typography color="text.secondary">Invocando espírito...</Typography>
                        </Box>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchBotStatus}
                        sx={{ 
                            mt: 3,
                            borderColor: '#8B5CF6',
                            color: '#8B5CF6',
                            '&:hover': {
                                borderColor: '#A78BFA',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)'
                            }
                        }}
                    >
                        Atualizar Status
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};

export default BotStatusPage;
