import React, { useState, useEffect } from 'react';
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
    Edit as EditIcon,
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
    const [severityFilter, setSeverityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [warningForm, setWarningForm] = useState({
        memberIds: [],
        warningType: 'absence',
        severity: 'low',
        description: '',
        sessionId: '',
        issuedById: ''
    });

    // Mock data para demonstração
    const mockMembers = [
        { id: 1, family_name: 'DragonSlayer' },
        { id: 2, family_name: 'ShadowMage' },
        { id: 3, family_name: 'IronKnight' },
        { id: 4, family_name: 'FireWizard' },
        { id: 5, family_name: 'StormRanger' },
        { id: 6, family_name: 'DarkPaladin' },
        { id: 7, family_name: 'MysticArcher' },
        { id: 8, family_name: 'BloodWarrior' }
    ];

    const mockSessions = [
        { id: 1, name: 'Node War #001', date: '2024-01-15' },
        { id: 2, name: 'Node War #002', date: '2024-01-17' },
        { id: 3, name: 'Node War #003', date: '2024-01-19' },
        { id: 4, name: 'Node War #004', date: '2024-01-22' }
    ];

    const mockWarnings = [
        {
            id: 1,
            member_id: 1,
            member_name: 'DragonSlayer',
            warning_type: 'absence',
            severity: 'medium',
            description: 'Ausência não justificada na Node War #001',
            session_id: 1,
            session_name: 'Node War #001',
            issued_by: 'Admin',
            issued_at: '2024-01-15 21:00:00',
            is_active: true,
            resolved_at: null,
            resolved_by: null,
            resolution_notes: null
        },
        {
            id: 2,
            member_id: 2,
            member_name: 'ShadowMage',
            warning_type: 'behavior',
            severity: 'high',
            description: 'Comportamento inadequado durante a guerra',
            session_id: 1,
            session_name: 'Node War #001',
            issued_by: 'Admin',
            issued_at: '2024-01-15 21:30:00',
            is_active: false,
            resolved_at: '2024-01-16 10:00:00',
            resolved_by: 'Admin',
            resolution_notes: 'Membro se desculpou e prometeu melhorar'
        },
        {
            id: 3,
            member_id: 3,
            member_name: 'IronKnight',
            warning_type: 'performance',
            severity: 'low',
            description: 'Performance abaixo do esperado',
            session_id: 2,
            session_name: 'Node War #002',
            issued_by: 'Admin',
            issued_at: '2024-01-17 21:15:00',
            is_active: true,
            resolved_at: null,
            resolved_by: null,
            resolution_notes: null
        }
    ];

    // Funções
    const handleOpenDialog = () => {
        setWarningForm({
            memberIds: [],
            warningType: 'absence',
            severity: 'low',
            description: '',
            sessionId: '',
            issuedById: ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setWarningForm({
            memberIds: [],
            warningType: 'absence',
            severity: 'low',
            description: '',
            sessionId: '',
            issuedById: ''
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
            
            // Simular salvamento em lote
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const selectedMemberNames = mockMembers
                .filter(member => warningForm.memberIds.includes(member.id))
                .map(member => member.family_name)
                .join(', ');
            
            setSnackbar({ 
                open: true, 
                message: `Advertência emitida para ${warningForm.memberIds.length} membros: ${selectedMemberNames} ⚠️`, 
                severity: 'success' 
            });
            
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

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low': return 'info';
            case 'medium': return 'warning';
            case 'high': return 'error';
            default: return 'default';
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case 'low': return 'Baixa';
            case 'medium': return 'Média';
            case 'high': return 'Alta';
            default: return 'Desconhecida';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'low': return <InfoIcon />;
            case 'medium': return <WarningIcon />;
            case 'high': return <ErrorIcon />;
            default: return <InfoIcon />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'absence': return 'Ausência';
            case 'behavior': return 'Comportamento';
            case 'performance': return 'Performance';
            case 'other': return 'Outros';
            default: return 'Desconhecido';
        }
    };

    // Filtros
    const filteredWarnings = mockWarnings.filter(warning => {
        const matchesSearch = warning.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            warning.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || warning.warning_type === typeFilter;
        const matchesSeverity = !severityFilter || warning.severity === severityFilter;
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'active' && warning.is_active) ||
                            (statusFilter === 'resolved' && !warning.is_active);
        return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });

    const paginatedWarnings = filteredWarnings.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Estatísticas
    const totalWarnings = mockWarnings.length;
    const activeWarnings = mockWarnings.filter(w => w.is_active).length;
    const resolvedWarnings = mockWarnings.filter(w => !w.is_active).length;
    const highSeverityWarnings = mockWarnings.filter(w => w.severity === 'high' && w.is_active).length;

    useEffect(() => {
        // Simular carregamento
        setTimeout(() => setLoading(false), 1000);
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
                                        {totalWarnings}
                                    </Typography>
                                </Box>
                                <WarningIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                                        Ativas
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                                        {activeWarnings}
                                    </Typography>
                                </Box>
                                <ErrorIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                                        Resolvidas
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                                        {resolvedWarnings}
                                    </Typography>
                                </Box>
                                <ResolvedIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                                        Alta Severidade
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'error.main' }}>
                                        {highSeverityWarnings}
                                    </Typography>
                                </Box>
                                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                                <MenuItem value="absence">Ausência</MenuItem>
                                <MenuItem value="behavior">Comportamento</MenuItem>
                                <MenuItem value="performance">Performance</MenuItem>
                                <MenuItem value="other">Outros</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Severidade</InputLabel>
                            <Select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                label="Severidade"
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="low">Baixa</MenuItem>
                                <MenuItem value="medium">Média</MenuItem>
                                <MenuItem value="high">Alta</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="active">Ativas</MenuItem>
                                <MenuItem value="resolved">Resolvidas</MenuItem>
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
                                <TableCell align="center">Severidade</TableCell>
                                <TableCell>Descrição</TableCell>
                                <TableCell align="center">Sessão</TableCell>
                                <TableCell>Emitida por</TableCell>
                                <TableCell align="center">Status</TableCell>
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
                                    <TableCell align="center">
                                        <Tooltip title={getSeverityLabel(warning.severity)}>
                                            <Chip
                                                icon={getSeverityIcon(warning.severity)}
                                                label={getSeverityLabel(warning.severity)}
                                                color={getSeverityColor(warning.severity)}
                                                size="small"
                                            />
                                        </Tooltip>
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
                                        {warning.session_id ? (
                                            <Chip 
                                                label={`#${warning.session_id}`} 
                                                size="small" 
                                                variant="outlined"
                                                color="primary"
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                -
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {warning.issued_by}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(warning.issued_at).toLocaleDateString('pt-BR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {warning.is_active ? (
                                            <Chip
                                                label="Ativa"
                                                size="small"
                                                color="warning"
                                            />
                                        ) : (
                                            <Chip
                                                label="Resolvida"
                                                size="small"
                                                color="success"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar">
                                            <IconButton 
                                                size="small" 
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton 
                                                size="small" 
                                                color="error"
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
                                options={mockMembers}
                                getOptionLabel={(option) => option.family_name}
                                value={mockMembers.filter(member => warningForm.memberIds.includes(member.id))}
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
                                    <MenuItem value="absence">Ausência</MenuItem>
                                    <MenuItem value="behavior">Comportamento</MenuItem>
                                    <MenuItem value="performance">Performance</MenuItem>
                                    <MenuItem value="other">Outros</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Severidade</InputLabel>
                                <Select
                                    value={warningForm.severity}
                                    onChange={(e) => handleFormChange('severity', e.target.value)}
                                    label="Severidade"
                                >
                                    <MenuItem value="low">Baixa</MenuItem>
                                    <MenuItem value="medium">Média</MenuItem>
                                    <MenuItem value="high">Alta</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Sessão (Opcional)</InputLabel>
                                <Select
                                    value={warningForm.sessionId}
                                    onChange={(e) => handleFormChange('sessionId', e.target.value)}
                                    label="Sessão (Opcional)"
                                >
                                    <MenuItem value="">Nenhuma</MenuItem>
                                    {mockSessions.map(session => (
                                        <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={mockMembers}
                                getOptionLabel={(option) => option.family_name}
                                value={mockMembers.find(member => member.id === warningForm.issuedById) || null}
                                onChange={(event, newValue) => {
                                    handleFormChange('issuedById', newValue ? newValue.id : '');
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Emitida por"
                                        placeholder="Digite para pesquisar..."
                                    />
                                )}
                                noOptionsText="Nenhum membro encontrado"
                                clearText="Limpar"
                                openText="Abrir"
                                closeText="Fechar"
                            />
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
