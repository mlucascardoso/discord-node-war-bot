import React from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const NodeWarPage = ({ 
    channels, 
    selectedChannel, 
    setSelectedChannel, 
    executeNodeWar, 
    loading, 
    fetchChannels 
}) => {
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
                Batalha Mística
            </Typography>
            
            <Card sx={{ 
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
            }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color: '#EC4899', fontWeight: 600 }}>
                        Invocar Node War
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel sx={{ color: '#B8B8B8' }}>Canal de Batalha</InputLabel>
                        <Select
                            value={selectedChannel}
                            onChange={(e) => setSelectedChannel(e.target.value)}
                            label="Canal de Batalha"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(139, 92, 246, 0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8B5CF6',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8B5CF6',
                                },
                            }}
                        >
                            {channels.map((channel) => (
                                <MenuItem key={channel.id} value={channel.id}>
                                    #{channel.name} ({channel.guildName})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PlayIcon />}
                        onClick={executeNodeWar}
                        disabled={loading || !selectedChannel}
                        fullWidth
                        sx={{
                            mb: 2,
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                            fontWeight: 600,
                            py: 1.5,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
                            },
                            '&:disabled': {
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: 'rgba(255, 255, 255, 0.5)',
                            }
                        }}
                    >
                        {loading ? 'Invocando Batalha...' : 'Iniciar Node War'}
                    </Button>

                    <Button
                        variant="text"
                        startIcon={<RefreshIcon />}
                        onClick={fetchChannels}
                        fullWidth
                        sx={{ 
                            color: '#8B5CF6',
                            '&:hover': {
                                backgroundColor: 'rgba(139, 92, 246, 0.1)'
                            }
                        }}
                    >
                        Atualizar Canais
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};

export default NodeWarPage;
