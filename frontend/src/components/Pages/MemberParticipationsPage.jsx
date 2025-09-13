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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sessionFilter, setSessionFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [participationForm, setParticipationForm] = useState({
        memberIds: [],
        sessionId: '',
        participationStatus: 'present',
        absenceReason: '',
        recordedById: ''
    });

    const [members, setMembers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [lastReset, setLastReset] = useState(null);
    const [memberPerformance, setMemberPerformance] = useState([]);
    const [stats, setStats] = useState({
        total_participations: 0,
        present_count: 0,
        late_count: 0,
        absent_count: 0
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
            memberIds: [],
            sessionId: '',
            participationStatus: 'present',
            absenceReason: '',
            recordedById: ''
        });
    };

    const handleFormChange = (field, value) => {
        setParticipationForm(prev => ({
            ...prev,
            [field]: value
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
                present_count: participationsData.filter(p => p.participation_status === 'present').length,
                late_count: participationsData.filter(p => p.participation_status === 'late').length,
                absent_count: participationsData.filter(p => p.participation_status === 'absent').length
            });
        } catch (error) {
            console.error('Error loading data:', error);
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


    const handleSaveParticipation = async () => {
        try {
            setFormLoading(true);
            
            const validation = validateParticipationData(participationForm);
            if (!validation.isValid) {
                setSnackbar({
                    open: true,
                    message: `Erro de validação: ${validation.errors.join(', ')}`,
                    severity: 'error'
                });
                return;
            }
            
            await createBulkParticipations(participationForm);
            
            const selectedMemberNames = members
                .filter(member => participationForm.memberIds.includes(member.id))
                .map(member => member.family_name)
                .join(', ');
            
            const sessionName = sessions.find(s => s.id === participationForm.sessionId)?.name || 'Sessão';
            const statusLabel = getStatusLabel(participationForm.participationStatus);
            
            setSnackbar({ 
                open: true, 
                message: `Participação registrada para ${participationForm.memberIds.length} membros em ${sessionName}: ${statusLabel} - ${selectedMemberNames} ⚔️`, 
                severity: 'success' 
            });
            
            await loadData();
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ 
                open: true, 
                message: `Erro ao registrar participações: ${error.message}`, 
                severity: 'error' 
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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

    const filteredParticipations = participations.filter(participation => {
        const matchesSearch = participation.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             participation.session_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || participation.participation_status === statusFilter;
        const matchesSession = !sessionFilter || participation.session_id === parseInt(sessionFilter);
        return matchesSearch && matchesStatus && matchesSession;
    });

    const paginatedParticipations = filteredParticipations.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    useEffect(() => {
        loadData();
    }, []);

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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Controle de Presença
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Registre e acompanhe a participação dos membros nas Node Wars
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    onClick={handleWeeklyReset}
                    disabled={resetLoading}
                    sx={{ minWidth: 160 }}
                >
                    {resetLoading ? 'Resetando...' : 'Reset Semanal'}
                </Button>
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
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="h6">
                                        Presentes
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                                        {stats.present_count}
                                    </Typography>
                                </Box>
                                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="h6">
                                        Atrasados
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                                        {stats.late_count}
                                    </Typography>
                                </Box>
                                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="h6">
                                        Ausentes
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'error.main' }}>
                                        {stats.absent_count}
                                    </Typography>
                                </Box>
                                <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {lastReset && (
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="text.secondary" variant="h6">
                                        Último Reset Semanal
                                    </Typography>
                                    <RefreshIcon sx={{ fontSize: 24, color: 'info.main' }} />
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

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Membro ou sessão..."
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                            {PARTICIPATION_STATUS_OPTIONS.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Sessão</InputLabel>
                            <Select
                                value={sessionFilter}
                                onChange={(e) => setSessionFilter(e.target.value)}
                                label="Sessão"
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {sessions.map(session => (
                                    <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

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

            {/* Tabela */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Membro</TableCell>
                                <TableCell>Sessão</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell>Motivo da Ausência</TableCell>
                                <TableCell>Registrado por</TableCell>
                                <TableCell>Data/Hora</TableCell>
                                <TableCell align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedParticipations.map((participation) => (
                                <TableRow key={participation.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {participation.member_name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="subtitle2" fontWeight="medium">
                                                {participation.member_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="primary">
                                            {participation.session_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {participation.participation_status === 'present' && (
                                            <Tooltip title="Presente">
                                                <CheckCircleIcon sx={{ fontSize: 24, color: 'success.main' }} />
                                            </Tooltip>
                                        )}
                                        {participation.participation_status === 'late' && (
                                            <Tooltip title="Atrasado">
                                                <ScheduleIcon sx={{ fontSize: 24, color: 'warning.main' }} />
                                            </Tooltip>
                                        )}
                                        {participation.participation_status === 'absent' && (
                                            <Tooltip title="Ausente">
                                                <CancelIcon sx={{ fontSize: 24, color: 'error.main' }} />
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {participation.absence_reason || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {participation.recorded_by_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(participation.recorded_at).toLocaleString('pt-BR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Excluir">
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDeleteParticipation(participation.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredParticipations.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* FAB */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={handleOpenDialog}
            >
                <GroupAddIcon />
            </Fab>

            {/* Dialog para cadastro em lote */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Registrar Participações em Lote
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={members}
                                getOptionLabel={(option) => option.family_name}
                                value={members.filter(member => participationForm.memberIds.includes(member.id))}
                                onChange={(event, newValue) => {
                                    const selectedIds = newValue.map(member => member.id);
                                    handleFormChange('memberIds', selectedIds);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Membros"
                                        placeholder="Digite para pesquisar e selecionar múltiplos membros..."
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            variant="outlined"
                                            label={option.family_name}
                                            {...getTagProps({ index })}
                                            key={option.id}
                                        />
                                    ))
                                }
                                noOptionsText="Nenhum membro encontrado"
                                clearText="Limpar todos"
                                openText="Abrir"
                                closeText="Fechar"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Sessão</InputLabel>
                                <Select
                                    value={participationForm.sessionId}
                                    onChange={(e) => handleFormChange('sessionId', e.target.value)}
                                    label="Sessão"
                                >
                                    {sessions.map(session => (
                                        <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status de Participação</InputLabel>
                                <Select
                                    value={participationForm.participationStatus}
                                    onChange={(e) => handleFormChange('participationStatus', e.target.value)}
                                    label="Status de Participação"
                                >
                                            {PARTICIPATION_STATUS_OPTIONS.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={members}
                                getOptionLabel={(option) => option.family_name}
                                value={members.find(member => member.id === participationForm.recordedById) || null}
                                onChange={(event, newValue) => {
                                    handleFormChange('recordedById', newValue ? newValue.id : '');
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Registrado por"
                                        placeholder="Digite para pesquisar..."
                                    />
                                )}
                                noOptionsText="Nenhum membro encontrado"
                                clearText="Limpar"
                                openText="Abrir"
                                closeText="Fechar"
                            />
                        </Grid>
                        {participationForm.participationStatus === 'absent' && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Motivo da Ausência"
                                    multiline
                                    rows={2}
                                    value={participationForm.absenceReason}
                                    onChange={(e) => handleFormChange('absenceReason', e.target.value)}
                                    placeholder="Descreva o motivo da ausência..."
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                Será aplicado a {participationForm.memberIds.length} membro(s) selecionado(s)
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        onClick={handleSaveParticipation} 
                        variant="contained"
                        disabled={formLoading || participationForm.memberIds.length === 0 || !participationForm.sessionId || !participationForm.recordedById}
                        startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <GroupAddIcon />}
                    >
                        {formLoading ? 'Registrando...' : `Registrar ${participationForm.memberIds.length} Participação(ões)`}
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
