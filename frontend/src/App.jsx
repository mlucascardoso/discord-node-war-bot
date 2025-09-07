import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Alert,
    CircularProgress,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
    PlayArrow as PlayIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon
} from '@mui/icons-material';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7289da',
        },
        secondary: {
            main: '#99aab5',
        },
        background: {
            default: '#2c2f33',
            paper: '#36393f',
        },
    },
});

function App() {
    const [botStatus, setBotStatus] = useState(null);
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    const fetchBotStatus = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/status`);
            const data = await response.json();
            setBotStatus(data);
        } catch (error) {
            console.error('Erro ao buscar status:', error);
            setMessage({ type: 'error', text: 'Erro ao conectar com o bot' });
        }
    };

    const fetchChannels = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/channels`);
            const data = await response.json();
            setChannels(data.channels || []);
        } catch (error) {
            console.error('Erro ao buscar canais:', error);
            setMessage({ type: 'error', text: 'Erro ao buscar canais' });
        }
    };

    const executeNodeWar = async () => {
        if (!selectedChannel) {
            setMessage({ type: 'error', text: 'Selecione um canal primeiro' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/nodewar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ channelId: selectedChannel }),
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage({ type: 'success', text: 'NodeWar executado com sucesso!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Erro ao executar NodeWar' });
            }
        } catch (error) {
            console.error('Erro ao executar NodeWar:', error);
            setMessage({ type: 'error', text: 'Erro ao executar NodeWar' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBotStatus();
        fetchChannels();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Discord Node War Bot
                </Typography>
                
                {message && (
                    <Alert 
                        severity={message.type} 
                        sx={{ mb: 3 }}
                        onClose={() => setMessage(null)}
                    >
                        {message.text}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Status do Bot
                                </Typography>
                                
                                {botStatus ? (
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                                            {botStatus.botReady ? (
                                                <CheckIcon color="success" />
                                            ) : (
                                                <ErrorIcon color="error" />
                                            )}
                                            <Chip 
                                                label={botStatus.botReady ? 'Online' : 'Offline'}
                                                color={botStatus.botReady ? 'success' : 'error'}
                                            />
                                        </Box>
                                        
                                        {botStatus.botUser && (
                                            <Typography variant="body2" color="text.secondary">
                                                Logado como: {botStatus.botUser}
                                            </Typography>
                                        )}
                                        
                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                            Última atualização: {new Date(botStatus.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <CircularProgress />
                                )}

                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchBotStatus}
                                    sx={{ mt: 2 }}
                                >
                                    Atualizar Status
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Executar NodeWar
                                </Typography>
                                
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Canal</InputLabel>
                                    <Select
                                        value={selectedChannel}
                                        onChange={(e) => setSelectedChannel(e.target.value)}
                                        label="Canal"
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
                                    color="primary"
                                    startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
                                    onClick={executeNodeWar}
                                    disabled={loading || !selectedChannel}
                                    fullWidth
                                >
                                    {loading ? 'Executando...' : 'Executar NodeWar'}
                                </Button>

                                <Button
                                    variant="text"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchChannels}
                                    sx={{ mt: 1 }}
                                    fullWidth
                                >
                                    Atualizar Canais
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;
