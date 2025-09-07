import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Chip,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fab,
    TablePagination,
    InputAdornment,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { 
    getAllMembers, 
    createMember, 
    updateMember, 
    deleteMember,
    validateMemberData,
    formatNumber,
    getProfileColor,
    AVAILABLE_CLASSES,
    AVAILABLE_PROFILES
} from '../../api/members.js';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [profileFilter, setProfileFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [memberForm, setMemberForm] = useState({
        familyName: '',
        characterName: '',
        class: '',
        level: '',
        ap: '',
        awakenedAp: '',
        dp: '',
        profile: ''
    });

    // Carregar membros da API
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const membersData = await getAllMembers();
                setMembers(membersData);
                setFilteredMembers(membersData);
            } catch (err) {
                console.error('Error fetching members:', err);
                setError('Erro ao carregar membros');
                setSnackbar({ open: true, message: 'Erro ao carregar membros', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Filtrar membros
    useEffect(() => {
        let filtered = members;

        if (searchTerm) {
            filtered = filtered.filter(member =>
                member.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.characterName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (classFilter) {
            filtered = filtered.filter(member => member.class === classFilter);
        }

        if (profileFilter) {
            filtered = filtered.filter(member => member.profile === profileFilter);
        }

        setFilteredMembers(filtered);
        setPage(0);
    }, [members, searchTerm, classFilter, profileFilter]);

    const handleOpenDialog = (member = null) => {
        if (member) {
            setEditingMember(member);
            setMemberForm(member);
        } else {
            setEditingMember(null);
            setMemberForm({
                familyName: '',
                characterName: '',
                class: '',
                level: '',
                ap: '',
                awakenedAp: '',
                dp: '',
                profile: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMember(null);
    };

    const handleFormChange = (field, value) => {
        setMemberForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveMember = async () => {
        try {
            // Validar dados
            const validation = validateMemberData(memberForm);
            if (!validation.isValid) {
                setSnackbar({ 
                    open: true, 
                    message: validation.errors.join(', '), 
                    severity: 'error' 
                });
                return;
            }

            const memberData = {
                familyName: memberForm.familyName.trim(),
                characterName: memberForm.characterName.trim(),
                class: memberForm.class,
                level: parseInt(memberForm.level) || 1,
                ap: parseInt(memberForm.ap) || 0,
                awakenedAp: parseInt(memberForm.awakenedAp) || 0,
                dp: parseInt(memberForm.dp) || 0,
                profile: memberForm.profile
            };

            if (editingMember) {
                // Editar membro existente
                const updatedMember = await updateMember(editingMember.id, memberData);
                setMembers(prev => prev.map(member =>
                    member.id === editingMember.id ? updatedMember : member
                ));
                setSnackbar({ 
                    open: true, 
                    message: 'Membro atualizado com sucesso!', 
                    severity: 'success' 
                });
            } else {
                // Adicionar novo membro
                const newMember = await createMember(memberData);
                setMembers(prev => [...prev, newMember]);
                setSnackbar({ 
                    open: true, 
                    message: 'Membro criado com sucesso!', 
                    severity: 'success' 
                });
            }
            
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving member:', error);
            setSnackbar({ 
                open: true, 
                message: `Erro ao salvar membro: ${error.message}`, 
                severity: 'error' 
            });
        }
    };

    const handleDeleteMember = async (memberId) => {
        try {
            await deleteMember(memberId);
            setMembers(prev => prev.filter(member => member.id !== memberId));
            setSnackbar({ 
                open: true, 
                message: 'Membro excluído com sucesso!', 
                severity: 'success' 
            });
        } catch (error) {
            console.error('Error deleting member:', error);
            setSnackbar({ 
                open: true, 
                message: `Erro ao excluir membro: ${error.message}`, 
                severity: 'error' 
            });
        }
    };

    // Função para fechar snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Loading state
    if (loading) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Carregando membros...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Membros da Guilda
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gerencie os membros da guilda e suas informações de combate
                </Typography>
            </Box>

            {/* Filtros e Busca */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Buscar por família ou personagem..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Classe</InputLabel>
                                <Select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    label="Classe"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {AVAILABLE_CLASSES.map(cls => (
                                        <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Perfil</InputLabel>
                                <Select
                                    value={profileFilter}
                                    onChange={(e) => setProfileFilter(e.target.value)}
                                    label="Perfil"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {AVAILABLE_PROFILES.map(profile => (
                                        <MenuItem key={profile} value={profile}>{profile}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={() => {
                                    setSearchTerm('');
                                    setClassFilter('');
                                    setProfileFilter('');
                                }}
                            >
                                Limpar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabela de Membros */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Família</TableCell>
                                <TableCell>Personagem</TableCell>
                                <TableCell>Classe</TableCell>
                                <TableCell align="center">Level</TableCell>
                                <TableCell align="center">AP</TableCell>
                                <TableCell align="center">AP Despertar</TableCell>
                                <TableCell align="center">DP</TableCell>
                                <TableCell align="center">GS</TableCell>
                                <TableCell align="center">Perfil</TableCell>
                                <TableCell align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMembers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((member) => (
                                    <TableRow key={member.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {member.familyName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{member.characterName}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={member.class} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight="bold">
                                                {member.level}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="primary">
                                                {formatNumber(member.ap)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="secondary">
                                                {formatNumber(member.awakenedAp)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="success.main">
                                                {formatNumber(member.dp)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight="bold" color="warning.main">
                                                {formatNumber(member.gearscore)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={member.profile} 
                                                size="small"
                                                color={getProfileColor(member.profile)}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenDialog(member)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleDeleteMember(member.id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredMembers.length}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Linhas por página"
                />
            </Card>

            {/* FAB para adicionar novo membro */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => handleOpenDialog()}
            >
                <AddIcon />
            </Fab>

            {/* Dialog para adicionar/editar membro */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingMember ? 'Editar Membro' : 'Adicionar Novo Membro'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nome da Família"
                                value={memberForm.familyName}
                                onChange={(e) => handleFormChange('familyName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nome do Personagem"
                                value={memberForm.characterName}
                                onChange={(e) => handleFormChange('characterName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Classe</InputLabel>
                                <Select
                                    value={memberForm.class}
                                    onChange={(e) => handleFormChange('class', e.target.value)}
                                    label="Classe"
                                >
                                    {AVAILABLE_CLASSES.map(cls => (
                                        <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Level"
                                type="number"
                                value={memberForm.level}
                                onChange={(e) => handleFormChange('level', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="AP"
                                type="number"
                                value={memberForm.ap}
                                onChange={(e) => handleFormChange('ap', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="AP Despertar"
                                type="number"
                                value={memberForm.awakenedAp}
                                onChange={(e) => handleFormChange('awakenedAp', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="DP"
                                type="number"
                                value={memberForm.dp}
                                onChange={(e) => handleFormChange('dp', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Perfil</InputLabel>
                                <Select
                                    value={memberForm.profile}
                                    onChange={(e) => handleFormChange('profile', e.target.value)}
                                    label="Perfil"
                                >
                                    {AVAILABLE_PROFILES.map(profile => (
                                        <MenuItem key={profile} value={profile}>{profile}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        onClick={handleSaveMember} 
                        variant="contained"
                        disabled={!memberForm.familyName || !memberForm.characterName || !memberForm.class}
                    >
                        {editingMember ? 'Salvar' : 'Adicionar'}
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
        </Container>
    );
};

export default MembersPage;

