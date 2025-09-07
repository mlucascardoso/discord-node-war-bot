import React from 'react';
import {
    Container,
    Typography,
    Paper
} from '@mui/material';

const SettingsPage = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ 
                p: 4, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
            }}>
                <Typography variant="h4" sx={{ color: '#8B5CF6', mb: 2 }}>
                    Configurações
                </Typography>
                <Typography color="text.secondary">
                    Em breve - Configurações avançadas da guilda
                </Typography>
            </Paper>
        </Container>
    );
};

export default SettingsPage;
