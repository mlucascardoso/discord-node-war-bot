import React, { useState, useEffect, useCallback } from 'react';
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
    CircularProgress,
    Grid,
    Box,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert,
    Paper,
    TextField
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Refresh as RefreshIcon,
    Stop as StopIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import {
    getAllNodewarTemplates
} from '../../api/nodewar-templates.js';
import {
    getActiveNodewarSession,
    getNodewarSessionMembers,
    createNodewarSession,
    closeActiveNodewarSession,
    formatNodewarSession,
    formatSessionMember,
    groupSessionMembersByRole,
    getSessionStats
} from '../../api/nodewar-sessions.js';
import PageLoader from '../UI/PageLoader.jsx';

const NodeWarPage = ({ 
    channels, 
    selectedChannel, 
    setSelectedChannel, 
    executeNodeWar, 
    loading, 
    fetchChannels 
}) => {
    // State management
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [scheduleDateTime, setScheduleDateTime] = useState('');
    const [activeSession, setActiveSession] = useState(null);
    const [sessionMembers, setSessionMembers] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [errorTimer, setErrorTimer] = useState(null);

    // Function to set errors with auto-clear timer
    const setErrorsWithTimer = useCallback((newErrors) => {
        // Clear existing timer
        if (errorTimer) {
            clearTimeout(errorTimer);
        }

        // Set new errors
        setErrors(newErrors);

        // Set new timer to clear errors after 5 seconds
        const timer = setTimeout(() => {
            setErrors([]);
            setErrorTimer(null);
        }, 5000);

        setErrorTimer(timer);
    }, [errorTimer]);

    // Clear errors manually
    const clearErrors = useCallback(() => {
        if (errorTimer) {
            clearTimeout(errorTimer);
            setErrorTimer(null);
        }
        setErrors([]);
    }, [errorTimer]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (errorTimer) {
                clearTimeout(errorTimer);
            }
        };
    }, [errorTimer]);

    // Load templates
    const loadTemplates = useCallback(async () => {
        try {
            const data = await getAllNodewarTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            setErrorsWithTimer(['Erro ao carregar templates']);
        }
    }, [setErrorsWithTimer]);

    // Load active session
    const loadActiveSession = useCallback(async () => {
        try {
            const session = await getActiveNodewarSession();
            setActiveSession(session);
            
            // Load members if there's an active session
            if (session?.id) {
                const members = await getNodewarSessionMembers(session.id);
                setSessionMembers(members);
            } else {
                setSessionMembers([]);
            }
        } catch (error) {
            console.error('Erro ao carregar sessão ativa:', error);
            setActiveSession(null);
            setSessionMembers([]);
        }
    }, []);

    // Load all data
    const loadData = useCallback(async () => {
        setPageLoading(true);
        try {
            await Promise.all([
                loadTemplates(),
                loadActiveSession()
            ]);
        } finally {
            setPageLoading(false);
        }
    }, [loadTemplates, loadActiveSession]);

    // Initial load
    useEffect(() => {
        loadData();
        
        // Set default schedule to 21h (9 PM) of the next day
        const defaultSchedule = new Date();
        defaultSchedule.setDate(defaultSchedule.getDate() + 1); // Next day
        defaultSchedule.setHours(21); // 21h (9 PM)
        defaultSchedule.setMinutes(0);
        defaultSchedule.setSeconds(0);
        defaultSchedule.setMilliseconds(0);
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        // datetime-local works with local time, so no timezone conversion needed
        const year = defaultSchedule.getFullYear();
        const month = String(defaultSchedule.getMonth() + 1).padStart(2, '0');
        const day = String(defaultSchedule.getDate()).padStart(2, '0');
        const hours = String(defaultSchedule.getHours()).padStart(2, '0');
        const minutes = String(defaultSchedule.getMinutes()).padStart(2, '0');
        
        const formattedSchedule = `${year}-${month}-${day}T${hours}:${minutes}`;
        setScheduleDateTime(formattedSchedule);
    }, [loadData]);

    // Create new session
    const handleCreateSession = async () => {
        if (!selectedTemplate || !selectedChannel || !scheduleDateTime) {
            setErrorsWithTimer(['Selecione um template, um canal e defina a data/hora']);
            return;
        }

        // Validate that schedule is in the future
        const scheduleDate = new Date(scheduleDateTime);
        const now = new Date();
        if (scheduleDate <= now) {
            setErrorsWithTimer(['A data/hora deve ser no futuro']);
            return;
        }

        setPageLoading(true);
        try {
            const sessionData = {
                templateId: selectedTemplate,
                channelId: selectedChannel,
                schedule: scheduleDate.toISOString()
            };

            await createNodewarSession(sessionData);
            await loadActiveSession();
            
            // Execute node war in Discord
            if (executeNodeWar) {
                await executeNodeWar();
            }
        } catch (error) {
            console.error('Erro ao criar sessão:', error);
            
            let errorMessages = ['Erro ao criar sessão'];
            if (error.details && Array.isArray(error.details)) {
                errorMessages = error.details;
            } else if (error.details && typeof error.details === 'string') {
                errorMessages = [error.details];
            } else if (error.message) {
                errorMessages = [error.message];
            }
            
            setErrorsWithTimer(errorMessages);
        } finally {
            setPageLoading(false);
        }
    };

    // Close active session
    const handleCloseSession = async () => {
        setPageLoading(true);
        try {
            await closeActiveNodewarSession();
            await loadActiveSession();
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
            setErrorsWithTimer(['Erro ao encerrar sessão']);
        } finally {
            setPageLoading(false);
        }
    };

    // Loading state
    if (pageLoading && !activeSession && templates.length === 0) {
        return <PageLoader message="Carregando dados da sessão..." />;
    }

    // Format session data
    const formattedSession = formatNodewarSession(activeSession);
    const groupedMembers = groupSessionMembersByRole(sessionMembers);
    const sessionStats = getSessionStats(activeSession, sessionMembers);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 4
            }}>
                Sessões NodeWar
            </Typography>

            {/* Error Messages */}
            {errors.length > 0 && (
                <Box mb={3}>
                    <Alert severity="error" onClose={clearErrors}>
                        {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </Alert>
                </Box>
            )}


            <Grid container spacing={3}>
                {/* Template Selection & Session Creation */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ color: '#EC4899', fontWeight: 600 }}>
                                {activeSession ? 'Sessão Ativa' : 'Nova Sessão'}
                            </Typography>

                            {!activeSession ? (
                                <>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel sx={{ color: 'rgba(139, 92, 246, 0.7)' }}>
                                            Template NodeWar
                                        </InputLabel>
                                        <Select
                                            value={selectedTemplate}
                                            onChange={(e) => setSelectedTemplate(e.target.value)}
                                            sx={{
                                                color: '#FFFFFF',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(139, 92, 246, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5CF6',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5CF6',
                                                },
                                                '& .MuiSelect-icon': {
                                                    color: '#8B5CF6',
                                                },
                                            }}
                                        >
                                            {templates.map((template) => (
                                                <MenuItem key={template.id} value={template.id}>
                                                    {template.name} (Tier {template.tier})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel sx={{ color: 'rgba(139, 92, 246, 0.7)' }}>
                                            Canal do Discord
                                        </InputLabel>
                                        <Select
                                            value={selectedChannel || ''}
                                            onChange={(e) => setSelectedChannel(e.target.value)}
                                            sx={{
                                                color: '#FFFFFF',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(139, 92, 246, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5CF6',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8B5CF6',
                                                },
                                                '& .MuiSelect-icon': {
                                                    color: '#8B5CF6',
                                                },
                                            }}
                                        >
                                            {channels.map((channel) => (
                                                <MenuItem key={channel.id} value={channel.id}>
                                                    # {channel.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <TextField
                                            label="Data e Hora da NodeWar"
                                            type="datetime-local"
                                            value={scheduleDateTime}
                                            onChange={(e) => setScheduleDateTime(e.target.value)}
                                            InputLabelProps={{
                                                shrink: true,
                                                sx: { color: 'rgba(139, 92, 246, 0.7)' }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    color: '#FFFFFF',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(139, 92, 246, 0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#8B5CF6',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#8B5CF6',
                                                    },
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: '#FFFFFF',
                                                },
                                                '& .MuiSvgIcon-root': {
                                                    color: '#8B5CF6',
                                                }
                                            }}
                                            helperText="Defina quando a NodeWar deve acontecer"
                                            FormHelperTextProps={{
                                                sx: { color: 'rgba(139, 92, 246, 0.6)' }
                                            }}
                                        />
                                    </FormControl>

                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<RefreshIcon />}
                                            onClick={fetchChannels}
                                            disabled={loading || pageLoading}
                                            sx={{
                                                background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)',
                                                }
                                            }}
                                        >
                                            Atualizar
                                        </Button>
                                        
                                        <Button
                                            variant="contained"
                                            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PlayIcon />}
                                            onClick={handleCreateSession}
                                            disabled={loading || pageLoading || !selectedTemplate || !selectedChannel || !scheduleDateTime}
                                            sx={{
                                                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                                                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                                                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
                                                },
                                                '&:disabled': {
                                                    background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                                                    boxShadow: 'none',
                                                }
                                            }}
                                        >
                                            {loading ? 'Criando...' : 'Iniciar NodeWar'}
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <Chip 
                                            label={`Tier ${formattedSession.tier}`}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: '#EC4899',
                                                color: 'white',
                                                fontWeight: 600
                                            }}
                                        />
                                        <Chip 
                                            label="Ativa"
                                            size="small"
                                            sx={{ 
                                                backgroundColor: '#10B981',
                                                color: 'white',
                                                fontWeight: 600
                                            }}
                                        />
                                    </Box>

                                    <Typography variant="h6" sx={{ color: '#8B5CF6', mb: 1 }}>
                                        {formattedSession.templateName}
                                    </Typography>

                                    {formattedSession.informativeText && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                            {formattedSession.informativeText.replace(/\\n/g, '\n')}
                                        </Typography>
                                    )}

                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <ScheduleIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Agendada: {formattedSession.schedule || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <InfoIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Criada: {formattedSession.createdAt}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={<StopIcon />}
                                        onClick={handleCloseSession}
                                        disabled={pageLoading}
                                        sx={{
                                            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                            }
                                        }}
                                    >
                                        Encerrar Sessão
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Session Members */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h5" sx={{ color: '#EC4899', fontWeight: 600 }}>
                                    Participantes
                                </Typography>
                                {activeSession && (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PeopleIcon sx={{ color: '#8B5CF6' }} />
                                        <Typography variant="h6" sx={{ color: '#8B5CF6' }}>
                                            {sessionStats.totalMembers}/{sessionStats.totalSlots}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {!activeSession ? (
                                <Paper sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px dashed rgba(139, 92, 246, 0.3)'
                                }}>
                                    <InfoIcon sx={{ fontSize: 48, color: 'rgba(139, 92, 246, 0.5)', mb: 2 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        Nenhuma sessão ativa
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Crie uma nova sessão para visualizar os participantes
                                    </Typography>
                                </Paper>
                            ) : sessionMembers.length === 0 ? (
                                <Paper sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px dashed rgba(139, 92, 246, 0.3)'
                                }}>
                                    <PeopleIcon sx={{ fontSize: 48, color: 'rgba(139, 92, 246, 0.5)', mb: 2 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        Nenhum participante
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Os membros aparecerão aqui quando se inscreverem
                                    </Typography>
                                </Paper>
                            ) : (
                                <Box>
                                    {/* Statistics */}
                                    <Box display="flex" gap={2} mb={3}>
                                        <Chip 
                                            label={`${sessionStats.occupancyRate}% ocupado`}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: sessionStats.occupancyRate >= 80 ? '#EF4444' : '#10B981',
                                                color: 'white'
                                            }}
                                        />
                                        <Chip 
                                            label={`${sessionStats.availableSlots} vagas`}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: '#8B5CF6',
                                                color: 'white'
                                            }}
                                        />
                                    </Box>

                                    {/* Members by Role */}
                                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {Object.entries(groupedMembers).map(([roleName, roleMembers]) => (
                                            <Box key={roleName} mb={2}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#EC4899', 
                                                    fontWeight: 600,
                                                    mb: 1 
                                                }}>
                                                    {roleName} ({roleMembers.length})
                                                </Typography>
                                                <List dense>
                                                    {roleMembers.map((member, index) => (
                                                        <ListItem key={member.id || index} sx={{ py: 0.5 }}>
                                                            <ListItemText 
                                                                primary={member.memberName}
                                                                secondary={member.joinedAt}
                                                                primaryTypographyProps={{
                                                                    color: '#FFFFFF',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                secondaryTypographyProps={{
                                                                    color: 'text.secondary',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                {Object.keys(groupedMembers).length > 1 && (
                                                    <Divider sx={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default NodeWarPage;