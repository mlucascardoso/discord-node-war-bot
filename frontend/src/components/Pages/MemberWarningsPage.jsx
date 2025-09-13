import React, { useState, useEffect } from 'react';
import { getAllMembers } from '../../api/members.js';
import {
    createBulkWarnings,
    deleteWarning,
    getAllWarnings,
    getWarningStats,
    WARNING_TYPE_OPTIONS,
    getWarningTypeColor,
    getWarningTypeLabel,
    validateWarningData
} from '../../api/member-warnings.js';
import {
    Typography,
    Paper,
    Box,
    Chip,
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    CheckCircle as ResolvedIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    GroupAdd as GroupAddIcon
} from '@mui/icons-material';

const MemberWarningsPage = () => {
    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [warningForm, setWarningForm] = useState({
        memberIds: [],
        warningType: 'falta',
        description: '',
    });

    const [members, setMembers] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [stats, setStats] = useState({
        total_warnings: 0,
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [membersData, warningsData, statsData] = await Promise.all([
                getAllMembers(),
                getAllWarnings(),
                getWarningStats()
            ]);
            
            setMembers(membersData);
            setWarnings(warningsData);
            setStats({
                total_warnings: parseInt(statsData.total_warnings) || 0,
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

    const handleDeleteWarning = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta advertência?')) {
            return;
        }
        
        try {
            await deleteWarning(id);
            setSnackbar({
                open: true,
                message: 'Advertência excluída com sucesso!',
                severity: 'success'
            });
            await loadData();
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Erro ao excluir advertência: ${error.message}`,
                severity: 'error'
            });
        }
    };



    // Funções
    const handleOpenDialog = () => {
        setWarningForm({
            memberIds: [],
            warningType: 'falta',
            description: '',
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setWarningForm({
            memberIds: [],
            warningType: 'falta',
            description: '',
        });
    };

    const handleFormChange = (field, value) => {
        setWarningForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveWarning = async () => {
        try {
            setFormLoading(true);
            
            const validation = validateWarningData(warningForm);
            if (!validation.isValid) {
                setSnackbar({
                    open: true,
                    message: `Erro de validação: ${validation.errors.join(', ')}`,
                    severity: 'error'
                });
                return;
            }
            
            await createBulkWarnings(warningForm);
            
            const selectedMemberNames = members
                .filter(member => warningForm.memberIds.includes(member.id))
                .map(member => member.family_name)
                .join(', ');
            
            const typeLabel = getWarningTypeLabel(warningForm.warningType);
            
            setSnackbar({ 
                open: true, 
                message: `Advertência ${typeLabel} emitida para ${warningForm.memberIds.length} membros: ${selectedMemberNames} ⚠️`, 
                severity: 'success' 
            });
            
            await loadData();
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ 
                open: true, 
                message: `Erro ao emitir advertências: ${error.message}`, 
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


    const getTypeLabel = (type) => {
        switch (type) {
            case 'falta': return 'Falta';
            case 'bot': return 'Bot';
            case 'classe': return 'Classe';
            case 'atraso': return 'Atraso';
            case 'comportamento': return 'Comportamento';
            default: return 'Desconhecido';
        }
    };

    // Filtros
    const filteredWarnings = warnings.filter(warning => {
        const matchesSearch = warning.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             warning.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || warning.warning_type === typeFilter;
        return matchesSearch && matchesType;
    });

    const paginatedWarnings = filteredWarnings.slice(
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
                    Advertências
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gerencie as advertências dos membros da guilda
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
                                        {stats.total_warnings}
                                    </Typography>
                                </Box>
                                <WarningIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Membro ou descrição..."
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                label="Tipo"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                            {WARNING_TYPE_OPTIONS.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
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
                                <TableCell align="center">Tipo</TableCell>
                                <TableCell>Descrição</TableCell>
                                <TableCell align="center">Data</TableCell>
                                <TableCell align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedWarnings.map((warning) => (
                                <TableRow key={warning.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {warning.member_name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="subtitle2" fontWeight="medium">
                                                {warning.member_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={getTypeLabel(warning.warning_type)} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={warning.description}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    maxWidth: 250, 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {warning.description}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {new Date(warning.issued_at).toLocaleDateString('pt-BR')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(warning.issued_at).toLocaleTimeString('pt-BR', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Excluir">
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDeleteWarning(warning.id)}
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
                    count={filteredWarnings.length}
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
                    Emitir Advertências em Lote
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={members}
                                getOptionLabel={(option) => option.family_name}
                                value={members.filter(member => warningForm.memberIds.includes(member.id))}
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
                                <InputLabel>Tipo de Advertência</InputLabel>
                                <Select
                                    value={warningForm.warningType}
                                    onChange={(e) => handleFormChange('warningType', e.target.value)}
                                    label="Tipo de Advertência"
                                >
                                            {WARNING_TYPE_OPTIONS.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição da Advertência"
                                multiline
                                rows={4}
                                value={warningForm.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="Descreva o motivo da advertência aplicável a todos os membros selecionados..."
                                helperText={`Será aplicado a ${warningForm.memberIds.length} membro(s) selecionado(s)`}
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        onClick={handleSaveWarning} 
                        variant="contained"
                        disabled={formLoading || warningForm.memberIds.length === 0 || !warningForm.description}
                        startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <GroupAddIcon />}
                    >
                        {formLoading ? 'Emitindo...' : `Emitir ${warningForm.memberIds.length} Advertência(s)`}
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

export default MemberWarningsPage;
