import React from 'react';
import { Box, Alert } from '@mui/material';

const AlertMessage = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <Box sx={{ p: 2 }}>
            <Alert 
                severity={message.type} 
                onClose={onClose}
                sx={{
                    backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#10B981' : '#EF4444',
                    border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
            >
                {message.text}
            </Alert>
        </Box>
    );
};

export default AlertMessage;
