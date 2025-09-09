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
    AVAILABLE_PROFILES
} from '../../api/members.js';
import { getAllGuilds } from '../../api/guilds.js';
import { getAllClasses } from '../../api/classes.js';
import { getAllClassProfiles } from '../../api/class-profiles.js';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [guilds, setGuilds] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classProfiles, setClassProfiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [profileFilter, setProfileFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [memberForm, setMemberForm] = useState({
        familyName: '',
        guildId: '',
        classId: '',
        classProfileId: '',
        level: '',
        ap: '',
        awakenedAp: '',
        dp: ''
    });

    // Carregar dados da API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [membersData, guildsData, classesData, classProfilesData] = await Promise.all([
                    getAllMembers(),
                    getAllGuilds(),
                    getAllClasses(),
                    getAllClassProfiles()
                ]);
                setMembers(membersData);
                setFilteredMembers(membersData);
                setGuilds(guildsData);
                setClasses(classesData);
                setClassProfiles(classProfilesData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Erro ao carregar dados');
                setSnackbar({ open: true, message: 'Erro ao carregar dados', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtrar membros
    useEffect(() => {
        let filtered = members;

        if (searchTerm) {
            filtered = filtered.filter(member =>
                member.family_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (classFilter) {
            filtered = filtered.filter(member => member.class_id === parseInt(classFilter));
        }

        if (profileFilter) {
            filtered = filtered.filter(member => member.class_profile_id === parseInt(profileFilter));
        }

        setFilteredMembers(filtered);
        setPage(0);
    }, [members, searchTerm, classFilter, profileFilter]);

    const handleOpenDialog = (member = null) => {
        if (member) {
            setEditingMember(member);
            // Mapear campos do backend (snake_case) para o formulário (camelCase)
            setMemberForm({
                familyName: member.family_name || '',
                guildId: member.guild_id || '',
                classId: member.class_id || '',
                classProfileId: member.class_profile_id || '',
                level: member.level || '',
                ap: member.ap || '',
                awakenedAp: member.awakened_ap || '',
                dp: member.dp || ''
            });
        } else {
            setEditingMember(null);
            setMemberForm({
                familyName: '',
                guildId: '',
                classId: '',
                classProfileId: '',
                level: '',
                ap: '',
                awakenedAp: '',
                dp: ''
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

            setFormLoading(true);

            const memberData = {
                familyName: memberForm.familyName.trim(),
                guildId: parseInt(memberForm.guildId),
                classId: parseInt(memberForm.classId),
                classProfileId: parseInt(memberForm.classProfileId),
                level: parseInt(memberForm.level) || 1,
                ap: parseInt(memberForm.ap) || 0,
                awakenedAp: parseInt(memberForm.awakenedAp) || 0,
                dp: parseInt(memberForm.dp) || 0
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
            
            // Extrair mensagens de erro detalhadas se disponíveis
            let errorMessage = error.message;
            if (error.details && Array.isArray(error.details)) {
                errorMessage = error.details.join(', ');
            } else if (error.message === 'Validation failed' || error.message === 'Erro de validação') {
                errorMessage = 'Erro de validação nos dados do membro';
            }
            
            setSnackbar({ 
                open: true, 
                message: errorMessage, 
                severity: 'error' 
            });
        } finally {
            setFormLoading(false);
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
                                placeholder="Buscar por família..."
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
                                    {classes.map(cls => (
                                        <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
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
                                    {classProfiles.map(profile => (
                                        <MenuItem key={profile.id} value={profile.id}>{profile.profile}</MenuItem>
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
                                <TableCell>Guild</TableCell>
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
                                                {member.family_name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={guilds.find(g => g.id === member.guild_id)?.name || 'N/A'} 
                                                size="small" 
                                                variant="outlined"
                                                color="info"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={classes.find(c => c.id === member.class_id)?.name || 'N/A'} 
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
                                                {formatNumber(member.awakened_ap)}
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
                                                label={classProfiles.find(p => p.id === member.class_profile_id)?.profile || 'N/A'} 
                                                size="small"
                                                color={getProfileColor(classProfiles.find(p => p.id === member.class_profile_id)?.profile)}
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
                                disabled={!!editingMember}
                                helperText={editingMember ? "Nome da família não pode ser alterado" : ""}
                                sx={editingMember ? {
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: '#9e9e9e !important',
                                        color: '#9e9e9e !important',
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    },
                                    '& .MuiInputBase-root.Mui-disabled': {
                                        color: '#9e9e9e'
                                    }
                                } : {}}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Guild</InputLabel>
                                <Select
                                    value={memberForm.guildId}
                                    onChange={(e) => handleFormChange('guildId', e.target.value)}
                                    label="Guild"
                                >
                                    {guilds.map(guild => (
                                        <MenuItem key={guild.id} value={guild.id}>{guild.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Classe</InputLabel>
                                <Select
                                    value={memberForm.classId}
                                    onChange={(e) => handleFormChange('classId', e.target.value)}
                                    label="Classe"
                                >
                                    {classes.map(cls => (
                                        <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
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
                                inputProps={{ min: 0, max: 400 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="AP Despertar"
                                type="number"
                                value={memberForm.awakenedAp}
                                onChange={(e) => handleFormChange('awakenedAp', e.target.value)}
                                inputProps={{ min: 0, max: 400 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="DP"
                                type="number"
                                value={memberForm.dp}
                                onChange={(e) => handleFormChange('dp', e.target.value)}
                                inputProps={{ min: 0, max: 600 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Perfil da Classe</InputLabel>
                                <Select
                                    value={memberForm.classProfileId}
                                    onChange={(e) => handleFormChange('classProfileId', e.target.value)}
                                    label="Perfil da Classe"
                                >
                                    {classProfiles.map(profile => (
                                        <MenuItem key={profile.id} value={profile.id}>{profile.profile}</MenuItem>
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
                        disabled={formLoading || !memberForm.familyName || !memberForm.guildId || !memberForm.classId || !memberForm.classProfileId}
                        startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {formLoading ? 'Salvando...' : (editingMember ? 'Salvar' : 'Adicionar')}
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

