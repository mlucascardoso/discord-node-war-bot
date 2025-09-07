import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Chip
} from '@mui/material';
import {
    Bolt as BoltIcon,
    Psychology as PsychologyIcon,
    Games as GamesIcon
} from '@mui/icons-material';

const WelcomePage = () => {
    return (
        <Box sx={{ 
            p: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh'
        }}>
            <Paper sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                maxWidth: 600
            }}>
                <Avatar
                    sx={{
                        width: 120,
                        height: 120,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        margin: '0 auto 24px auto',
                        fontSize: '3rem',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                    }}
                >
                    👻
                </Avatar>
                
                <Typography variant="h2" component="h1" gutterBottom sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                }}>
                    Bem-vindo à Guilda Banshee
                </Typography>
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
                    "Onde as almas perdidas encontram seu destino"
                </Typography>
                
                <Typography variant="body1" color="text.primary" sx={{ mb: 3, lineHeight: 1.8 }}>
                    Prepare-se para batalhas épicas, estratégias devastadoras e a união mais forte do reino.
                    A Banshee não é apenas uma guilda, é uma família de guerreiros místicos.
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Utilize o menu lateral para navegar pelos comandos e funcionalidades:
                    <br />
                    • Node Wars e Batalhas
                    <br />
                    • Configurações da Guilda  
                    <br />
                    • Status dos Membros
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<BoltIcon />}
                        label="Força Mística" 
                        sx={{ 
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            color: 'white',
                            fontWeight: 600
                        }} 
                    />
                    <Chip 
                        icon={<PsychologyIcon />}
                        label="Estratégia" 
                        sx={{ 
                            background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                            color: 'white',
                            fontWeight: 600
                        }} 
                    />
                    <Chip 
                        icon={<GamesIcon />}
                        label="União" 
                        sx={{ 
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 600
                        }} 
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default WelcomePage;
