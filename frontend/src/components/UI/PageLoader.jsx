import React from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Container
} from '@mui/material';

const PageLoader = ({ 
    message = 'Carregando...', 
    size = 60,
    minHeight = '400px',
    useContainer = true 
}) => {
    const LoaderContent = () => (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight,
            flexDirection: 'column',
            gap: 2
        }}>
            <CircularProgress 
                size={size} 
                sx={{ 
                    color: '#8B5CF6'
                }} 
            />
            <Typography 
                variant="h6" 
                sx={{ 
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textAlign: 'center'
                }}
            >
                {message}
            </Typography>
        </Box>
    );

    if (useContainer) {
        return (
            <Container maxWidth="xl">
                <LoaderContent />
            </Container>
        );
    }

    return <LoaderContent />;
};

export default PageLoader;
