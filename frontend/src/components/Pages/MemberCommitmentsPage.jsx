import React, { useState, useEffect } from 'react';
import { getAllMembers } from '../../api/members.js';
import {
    createBulkCommitments,
    deleteCommitment,
    getCommitmentStats,
    getCommitmentsWithProgress,
    updateCommitment,
    validateCommitmentData
} from '../../api/member-commitments.js';
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
    LinearProgress,
    Autocomplete,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    TrendingUp as TrendingUpIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    GroupAdd as GroupAddIcon
} from '@mui/icons-material';

const MemberCommitmentsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [commitmentForm, setCommitmentForm] = useState({
        memberIds: [],
        committedParticipations: 3,
        notes: ''
    });

    const [members, setMembers] = useState([]);
    const [commitments, setCommitments] = useState([]);
    const [stats, setStats] = useState({
        total_commitments: 0,
        fulfilled_commitments: 0,
        pending_commitments: 0,
        overdue_commitments: 0
    });

    // Funções
    const handleOpenDialog = () => {
        setCommitmentForm({
            memberIds: [],
            committedParticipations: 3,
            notes: ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCommitmentForm({
            memberIds: [],
            committedParticipations: 3,
            notes: ''
        });
    };

    const handleFormChange = (field, value) => {
        setCommitmentForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveCommitment = async () => {
        try {
            setFormLoading(true);
            
            const validation = validateCommitmentData(commitmentForm);
            if (!validation.isValid) {
                setSnackbar({
                    open: true,
                    message: `Erro de validação: ${validation.errors.join(', ')}`,
                    severity: 'error'
                });
                return;
            }
            
            await createBulkCommitments(commitmentForm);
            
            const selectedMemberNames = members
                .filter(member => commitmentForm.memberIds.includes(member.id))
                .map(member => member.family_name)
                .join(', ');
            
            setSnackbar({ 
                open: true, 
                message: `Comprometimento criado para ${commitmentForm.memberIds.length} membros: ${selectedMemberNames} ⚔️`, 
                severity: 'success' 
            });
            
            await loadData();
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ 
                open: true, 
                message: `Erro ao salvar comprometimentos: ${error.message}`, 
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
            case 'fulfilled': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'fulfilled': return 'Cumprido';
            case 'pending': return 'Pendente';
            case 'overdue': return 'Atrasado';
            default: return 'Desconhecido';
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [membersData, commitmentsData, statsData] = await Promise.all([
                getAllMembers(),
                getCommitmentsWithProgress(),
                getCommitmentStats()
            ]);
            
            setMembers(membersData);
            setCommitments(commitmentsData);
            setStats({
                total_commitments: parseInt(statsData.total_commitments) || 0,
                fulfilled_commitments: commitmentsData.filter(c => c.status === 'fulfilled').length,
                pending_commitments: commitmentsData.filter(c => c.status === 'pending').length,
                overdue_commitments: commitmentsData.filter(c => c.status === 'overdue').length
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

    const handleDeleteCommitment = async (id) => {
        try {
            await deleteCommitment(id);
            setSnackbar({
                open: true,
                message: 'Comprometimento excluído com sucesso!',
                severity: 'success'
            });
            await loadData();
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Erro ao excluir comprometimento: ${error.message}`,
                severity: 'error'
            });
        }
    };

    const filteredCommitments = commitments.filter(commitment => {
        const matchesSearch = commitment.member_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || commitment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const paginatedCommitments = filteredCommitments.slice(
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
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Comprometimentos de Participação
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gerencie os comprometimentos de participação dos membros nas Node Wars
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
                                        {stats.total_commitments}
                                    </Typography>
                                </Box>
                                <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                                        Cumpridos
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                                        {stats.fulfilled_commitments}
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
                                        Pendentes
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                                        {stats.pending_commitments}
                                    </Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                                    <Typography variant="h4" sx={{ color: 'error.main' }}>
                                        {stats.overdue_commitments}
                                    </Typography>
                                </Box>
                                <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Buscar membro"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                <MenuItem value="fulfilled">Cumprido</MenuItem>
                                <MenuItem value="pending">Pendente</MenuItem>
                                <MenuItem value="overdue">Atrasado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabela */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Membro</TableCell>
                                <TableCell align="center">Comprometido</TableCell>
                                <TableCell align="center">Realizado</TableCell>
                                <TableCell align="center">Progresso</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell>Observações</TableCell>
                                <TableCell align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedCommitments.map((commitment) => {
                                const progress = (commitment.actual_participations / commitment.committed_participations) * 100;
                                return (
                                    <TableRow key={commitment.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="medium">
                                                {commitment.member_name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="h6" color="primary">
                                                {commitment.committed_participations}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="h6" color={progress >= 100 ? 'success.main' : 'text.primary'}>
                                                {commitment.actual_participations}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ width: '100%', mr: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={Math.min(progress, 100)} 
                                                    color={progress >= 100 ? 'success' : progress >= 70 ? 'primary' : 'warning'}
                                                    sx={{ height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {Math.round(progress)}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={getStatusLabel(commitment.status)} 
                                                color={getStatusColor(commitment.status)} 
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={commitment.notes || 'Sem observações'}>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        maxWidth: 200, 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {commitment.notes || 'Sem observações'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Excluir">
                                                <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={() => handleDeleteCommitment(commitment.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredCommitments.length}
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
                    Criar Comprometimentos de Participação em Lote
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                                            <Autocomplete
                                                multiple
                                                options={members}
                                                getOptionLabel={(option) => option.family_name}
                                                value={members.filter(member => commitmentForm.memberIds.includes(member.id))}
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
                            <TextField
                                fullWidth
                                label="Participações Comprometidas"
                                type="number"
                                value={commitmentForm.committedParticipations}
                                onChange={(e) => handleFormChange('committedParticipations', e.target.value)}
                                inputProps={{ min: 0, max: 7 }}
                                helperText="Quantas node wars se compromete a participar"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Observações"
                                multiline
                                rows={3}
                                value={commitmentForm.notes}
                                onChange={(e) => handleFormChange('notes', e.target.value)}
                                placeholder="Observações aplicáveis a todos os membros selecionados..."
                                helperText={`Será aplicado a ${commitmentForm.memberIds.length} membro(s) selecionado(s)`}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        onClick={handleSaveCommitment} 
                        variant="contained"
                        disabled={formLoading || commitmentForm.memberIds.length === 0}
                        startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <GroupAddIcon />}
                    >
                        {formLoading ? 'Criando...' : `Criar ${commitmentForm.memberIds.length} Comprometimento(s)`}
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

export default MemberCommitmentsPage;
