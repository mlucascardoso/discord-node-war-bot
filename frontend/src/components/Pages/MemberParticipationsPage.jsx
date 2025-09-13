import React, { useState, useEffect } from 'react';
import { getAllMembers } from '../../api/members.js';
import { getAllNodewarSessions } from '../../api/nodewar-sessions.js';
import { getResetPreview, executeWeeklyReset, getLastReset, getMemberPerformance } from '../../api/weekly-reset.js';
import {
    createBulkParticipations,
    deleteParticipation,
    getAllParticipations,
    getParticipationStats,
    PARTICIPATION_STATUS_OPTIONS,
    getStatusColor,
    getStatusLabel,
    validateParticipationData
} from '../../api/member-participations.js';
import {
    Typography,
    Paper,
    Box,
    IconButton,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
    Avatar,
    Badge,
    Autocomplete,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    GroupAdd as GroupAddIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const MemberParticipationsPage = () => {
    // Estados
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [resultModal, setResultModal] = useState({
        open: false,
        title: '',
        message: '',
        warnings: [],
        severity: 'success'
    });
    const [participationForm, setParticipationForm] = useState({
        images: [],
        recognizedNames: [],
        customDate: ''
    });

    // Função para obter data atual de Brasília
    const getBrasiliaDate = () => {
        const now = new Date();
        const brasiliaOffset = -3 * 60; // UTC-3 em minutos
        const brasiliaTime = new Date(now.getTime() + brasiliaOffset * 60 * 1000);
        return brasiliaTime.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };

    const [members, setMembers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [lastReset, setLastReset] = useState(null);
    const [memberPerformance, setMemberPerformance] = useState([]);
    const [stats, setStats] = useState({
        total_participations: 0,
        unique_members: 0,
        unique_days: 0
    });

    // Funções
    const handleOpenDialog = () => {
        setParticipationForm({
            memberIds: [],
            sessionId: '',
            participationStatus: 'present',
            absenceReason: '',
            recordedById: ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setParticipationForm({
            images: [],
            recognizedNames: [],
            customDate: ''
        });
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setParticipationForm(prev => ({
            ...prev,
            images: [...(prev.images || []), ...files]
        }));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const files = Array.from(event.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length > 0) {
            setParticipationForm(prev => ({
                ...prev,
                images: [...(prev.images || []), ...files]
            }));
        }
    };

    const handlePaste = (event) => {
        const items = Array.from(event.clipboardData.items);
        const imageFiles = items
            .filter(item => item.type.startsWith('image/'))
            .map(item => item.getAsFile())
            .filter(Boolean);

        if (imageFiles.length > 0) {
            setParticipationForm(prev => ({
                ...prev,
                images: [...(prev.images || []), ...imageFiles]
            }));
        }
    };

    const handleRemoveImage = (index) => {
        setParticipationForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [membersData, sessionsData, participationsData, statsData, lastResetData, performanceData] = await Promise.all([
                getAllMembers(),
                getAllNodewarSessions(),
                getAllParticipations(),
                getParticipationStats(),
                getLastReset().catch(() => null), // Não falha se não houver reset anterior
                getMemberPerformance().catch(() => []) // Não falha se não houver dados
            ]);
            
            setMembers(membersData);
            setSessions(sessionsData);
            setParticipations(participationsData);
            setLastReset(lastResetData);
            setMemberPerformance(performanceData);
            setStats({
                total_participations: parseInt(statsData.total_participations) || 0,
                unique_members: parseInt(statsData.unique_members) || 0,
                unique_days: parseInt(statsData.unique_days) || 0
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Erro ao carregar dados: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteParticipation = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta participação?')) {
            return;
        }
        
        try {
            await deleteParticipation(id);
            setSnackbar({
                open: true,
                message: 'Participação excluída com sucesso!',
                severity: 'success'
            });
            await loadData();
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Erro ao excluir participação: ${error.message}`,
                severity: 'error'
            });
        }
    };

    const handleWeeklyReset = async () => {
        try {
            setResetLoading(true);
            
            // Primeiro, obter preview do reset
            const preview = await getResetPreview();
            
            const confirmMessage = `Tem certeza que deseja executar o reset semanal?\n\n` +
                `• ${preview.total_members} membros no total\n` +
                `• ${preview.members_with_participations} membros com participações\n` +
                `• ${preview.total_actual_participations} participações serão zeradas\n\n` +
                `Esta ação não pode ser desfeita!`;
            
            if (!window.confirm(confirmMessage)) {
                return;
            }
            
            // Executar o reset
            const result = await executeWeeklyReset();
            
            setSnackbar({
                open: true,
                message: result.message,
                severity: 'success'
            });
            
            // Recarregar dados
            await loadData();
            
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Erro ao executar reset semanal: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setResetLoading(false);
        }
    };


    const handleProcessImages = async () => {
        try {
            setFormLoading(true);
            
            if (!participationForm.images || participationForm.images.length === 0) {
                setSnackbar({
                    open: true,
                    message: 'Selecione pelo menos uma imagem',
                    severity: 'error'
                });
                return;
            }
            
            const formData = new FormData();
            participationForm.images.forEach((image, index) => {
                formData.append('images', image);
            });
            
            // Sempre enviar a data (customizada ou padrão de Brasília)
            const dateToSend = participationForm.customDate || getBrasiliaDate();
            formData.append('customDate', dateToSend);
            
            const response = await fetch('/api/member-participations/process-images', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                const errorMessage = result.error || 'Erro desconhecido';
                const details = result.details ? result.details.split('\n• ') : [];
                
                setResultModal({
                    open: true,
                    title: 'Erro no Processamento',
                    message: errorMessage,
                    warnings: details,
                    severity: 'error'
                });
                return;
            }
            
            setResultModal({
                open: true,
                title: 'Processamento Concluído',
                message: result.data.message || 'Processamento concluído!',
                warnings: result.data.warnings || [],
                severity: 'success'
            });
            
            await loadData();
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ 
                open: true, 
                message: `Erro ao processar imagens: ${error.message}`, 
                severity: 'error' 
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'success';
            case 'late': return 'warning';
            case 'absent': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'present': return 'Presente';
            case 'late': return 'Atrasado';
            case 'absent': return 'Ausente';
            default: return 'Desconhecido';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present': return <CheckCircleIcon />;
            case 'late': return <ScheduleIcon />;
            case 'absent': return <CancelIcon />;
            default: return <PersonIcon />;
        }
    };


    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleGlobalPaste = (event) => {
            if (openDialog) {
                handlePaste(event);
            }
        };

        if (openDialog) {
            document.addEventListener('paste', handleGlobalPaste);
        }

        return () => {
            document.removeEventListener('paste', handleGlobalPaste);
        };
    }, [openDialog]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Controle de Presença
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Registre e acompanhe a participação dos membros nas Node Wars
                </Typography>
            </Box>

            {/* Dashboard Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="h6">
                                        Total
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.total_participations}
                                    </Typography>
                                </Box>
                                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="h6">
                                        Membros Únicos
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                                        {stats.unique_members}
                                    </Typography>
                                </Box>
                                <PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="h6">
                                        Dias Únicos
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                                        {stats.unique_days}
                                    </Typography>
                                </Box>
                                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {lastReset && (
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ mb: 1 }}>
                                    <Typography color="text.secondary" variant="h6">
                                        Último Reset Semanal
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {new Date(lastReset.reset_timestamp).toLocaleString('pt-BR')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Membros Resetados
                                        </Typography>
                                        <Typography variant="h6" color="primary.main">
                                            {lastReset.members_reset}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Participações Zeradas
                                        </Typography>
                                        <Typography variant="h6" color="warning.main">
                                            {lastReset.total_participations_before || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>


            {/* Desempenho dos Membros */}
            {memberPerformance.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Desempenho dos Membros
                    </Typography>
                    
                    <Grid container spacing={2}>
                        {/* Membros que completaram 100% */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="success.dark">
                                    ✅ Completo (100%)
                                </Typography>
                                <Typography variant="body2" color="success.dark" gutterBottom>
                                    {memberPerformance.filter(m => m.performance_status === 'completo').length} membros
                                </Typography>
                                {memberPerformance
                                    .filter(m => m.performance_status === 'completo')
                                    .map(member => (
                                        <Box key={member.member_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {member.member_name}
                                            </Typography>
                                            <Typography variant="caption" color="success.dark">
                                                {member.actual_participations}/{member.committed_participations}
                                            </Typography>
                                        </Box>
                                    ))
                                }
                            </Box>
                        </Grid>

                        {/* Membros com participação parcial */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                                    ⚠️ Parcial
                                </Typography>
                                <Typography variant="body2" color="warning.dark" gutterBottom>
                                    {memberPerformance.filter(m => m.performance_status === 'parcial').length} membros
                                </Typography>
                                {memberPerformance
                                    .filter(m => m.performance_status === 'parcial')
                                    .map(member => (
                                        <Box key={member.member_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {member.member_name}
                                            </Typography>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" color="warning.dark">
                                                    {member.actual_participations}/{member.committed_participations}
                                                </Typography>
                                                <Typography variant="caption" color="warning.dark" sx={{ display: 'block' }}>
                                                    ({member.completion_percentage}%)
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                                }
                            </Box>
                        </Grid>

                        {/* Membros que não participaram */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="error.dark">
                                    ❌ Não Participou
                                </Typography>
                                <Typography variant="body2" color="error.dark" gutterBottom>
                                    {memberPerformance.filter(m => m.performance_status === 'não_participou').length} membros
                                </Typography>
                                {memberPerformance
                                    .filter(m => m.performance_status === 'não_participou')
                                    .map(member => (
                                        <Box key={member.member_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {member.member_name}
                                            </Typography>
                                            <Typography variant="caption" color="error.dark">
                                                0/{member.committed_participations}
                                            </Typography>
                                        </Box>
                                    ))
                                }
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}


            {/* Botões Flutuantes */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={handleOpenDialog}
            >
                <GroupAddIcon />
            </Fab>
            
            <Fab
                color="warning"
                aria-label="reset"
                sx={{ position: 'fixed', bottom: 16, right: 88 }}
                onClick={handleWeeklyReset}
                disabled={resetLoading}
            >
                {resetLoading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            </Fab>

            {/* Dialog para cadastro em lote */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Registrar Participações por Imagem
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'primary.main',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.hover'
                                    }
                                }}
                                onClick={() => document.getElementById('image-upload').click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onPaste={handlePaste}
                                tabIndex={0}
                            >
                                <input
                                    id="image-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" color="primary.main" gutterBottom>
                                        Selecione as imagens da Node War
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Clique aqui, arraste as imagens ou use Ctrl+V para colar
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Imagens com os nomes dos participantes serão processadas automaticamente
                                    </Typography>
                                </Box>
                                {participationForm.images && participationForm.images.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="success.main">
                                            {participationForm.images.length} imagem(ns) selecionada(s)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        
                        {participationForm.images && participationForm.images.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Imagens Selecionadas:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {participationForm.images.map((image, index) => (
                                        <Chip
                                            key={index}
                                            label={image.name}
                                            onDelete={() => handleRemoveImage(index)}
                                            variant="outlined"
                                            color="primary"
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Data da Node War"
                                type="date"
                                value={participationForm.customDate || getBrasiliaDate()}
                                onChange={(e) => setParticipationForm(prev => ({
                                    ...prev,
                                    customDate: e.target.value
                                }))}
                                helperText="Data atual de Brasília (pode ser alterada se necessário)"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        onClick={handleProcessImages} 
                        variant="contained"
                        disabled={formLoading || !participationForm.images || participationForm.images.length === 0}
                        startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <GroupAddIcon />}
                    >
                        {formLoading ? 'Processando...' : `Processar ${participationForm.images ? participationForm.images.length : 0} Imagem(ns)`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Resultado */}
            <Dialog
                open={resultModal.open}
                onClose={() => setResultModal({ ...resultModal, open: false })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    color: resultModal.severity === 'error' ? 'error.main' : 'success.main',
                    fontWeight: 'bold'
                }}>
                    {resultModal.title}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {resultModal.message}
                        </Typography>
                        
                        {resultModal.warnings && resultModal.warnings.length > 0 && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 1, color: 'warning.main' }}>
                                    {resultModal.severity === 'error' ? 'Detalhes:' : 'Avisos:'}
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                    {resultModal.warnings.map((warning, index) => (
                                        <Typography 
                                            key={index} 
                                            component="li" 
                                            variant="body2" 
                                            sx={{ mb: 0.5 }}
                                        >
                                            {warning}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setResultModal({ ...resultModal, open: false })}
                        variant="contained"
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificações */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MemberParticipationsPage;
