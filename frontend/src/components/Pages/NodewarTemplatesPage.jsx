import React, { useCallback, useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import {
    getAllNodewarTemplates,
    createNodewarTemplate,
    updateNodewarTemplate,
    validateNodewarTemplate,
    formatNodewarTemplate,
    getDefaultTemplateData,
    calculateTotalSlots
} from '../../api/nodewar-templates.js';

const NodewarTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState(getDefaultTemplateData());
    const [errors, setErrors] = useState([]);

    // Load templates
    const loadTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllNodewarTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            setErrors(['Erro ao carregar templates']);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Handle form changes
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: field.includes('slots') || field === 'tier' || field === 'waitlist' 
                ? parseInt(value) || 0 
                : value
        }));
    };

    // Open dialog for new template
    const handleNewTemplate = () => {
        setEditingTemplate(null);
        setFormData(getDefaultTemplateData());
        setErrors([]);
        setDialogOpen(true);
    };

    // Open dialog for editing template
    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name || '',
            informative_text: template.informative_text || '',
            tier: template.tier || 2,
            bomber_slots: template.bomber_slots || 0,
            frontline_slots: template.frontline_slots || 0,
            ranged_slots: template.ranged_slots || 0,
            shai_slots: template.shai_slots || 0,
            pa_slots: template.pa_slots || 0,
            flag_slots: template.flag_slots || 0,
            defense_slots: template.defense_slots || 0,
            caller_slots: template.caller_slots || 0,
            elephant_slots: template.elephant_slots || 0,
            waitlist: template.waitlist || 0
        });
        setErrors([]);
        setDialogOpen(true);
    };

    // Save template
    const handleSaveTemplate = async () => {
        const validation = validateNodewarTemplate(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setLoading(true);
        try {
            const templateData = {
                ...formData,
                total_slots: calculateTotalSlots(formData)
            };

            if (editingTemplate) {
                await updateNodewarTemplate(editingTemplate.id, templateData);
            } else {
                await createNodewarTemplate(templateData);
            }

            setDialogOpen(false);
            await loadTemplates();
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            setErrors(['Erro ao salvar template']);
        } finally {
            setLoading(false);
        }
    };

    // Close dialog
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingTemplate(null);
        setFormData(getDefaultTemplateData());
        setErrors([]);
    };

    // Slot configuration fields
    const slotFields = [
        { key: 'bomber_slots', label: 'Bomber', icon: '💥' },
        { key: 'frontline_slots', label: 'Frontline', icon: '⚔️' },
        { key: 'ranged_slots', label: 'Ranged', icon: '🏹' },
        { key: 'shai_slots', label: 'Shai', icon: '🥁' },
        { key: 'pa_slots', label: 'PA', icon: '🔮' },
        { key: 'flag_slots', label: 'Flag', icon: '🚩' },
        { key: 'defense_slots', label: 'Defense', icon: '🛡️' },
        { key: 'caller_slots', label: 'Caller', icon: '🎙️' },
        { key: 'elephant_slots', label: 'Elephant', icon: '🐘' },
        { key: 'waitlist', label: 'Waitlist', icon: '⏳' }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                }}>
                    Templates NodeWar
                </Typography>
                
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewTemplate}
                    sx={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
                        }
                    }}
                >
                    Novo Template
                </Button>
            </Box>

            {loading && !dialogOpen && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress sx={{ color: '#8B5CF6' }} />
                </Box>
            )}

            <Grid container spacing={3}>
                {templates.map((template) => {
                    const formatted = formatNodewarTemplate(template);
                    return (
                        <Grid item xs={12} md={6} lg={4} key={template.id}>
                            <Card sx={{
                                background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                                                {formatted.name}
                                            </Typography>
                                            <Chip 
                                                label={`Tier ${formatted.tier}`}
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: '#EC4899',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    mt: 0.5
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <Tooltip title="Editar template">
                                                <IconButton 
                                                    onClick={() => handleEditTemplate(template)}
                                                    sx={{ color: '#8B5CF6' }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {formatted.informative_text && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {formatted.informative_text}
                                        </Typography>
                                    )}

                                    <Divider sx={{ my: 2, borderColor: 'rgba(139, 92, 246, 0.2)' }} />

                                    <Typography variant="subtitle2" sx={{ color: '#EC4899', mb: 1, fontWeight: 600 }}>
                                        Total de Slots: {formatted.totalSlots}
                                    </Typography>

                                    <Grid container spacing={1}>
                                        {Object.entries(formatted.slots).map(([role, count]) => {
                                            if (count === 0) return null;
                                            const field = slotFields.find(f => f.key === `${role}_slots` || f.key === role);
                                            return (
                                                <Grid item xs={6} key={role}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {field?.icon} {field?.label || role}: {count}
                                                    </Typography>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Dialog for Create/Edit Template */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D1B69 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                    }
                }}
            >
                <DialogTitle sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
                
                <DialogContent>
                    {errors.length > 0 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.map((error, index) => (
                                <div key={index}>{error}</div>
                            ))}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Nome do Template"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                                        '&:hover fieldset': { borderColor: '#8B5CF6' },
                                        '&.Mui-focused fieldset': { borderColor: '#8B5CF6' }
                                    }
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Tier"
                                value={formData.tier}
                                onChange={(e) => handleFormChange('tier', e.target.value)}
                                margin="normal"
                                inputProps={{ min: 1, max: 5 }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                                        '&:hover fieldset': { borderColor: '#8B5CF6' },
                                        '&.Mui-focused fieldset': { borderColor: '#8B5CF6' }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Texto Informativo"
                                value={formData.informative_text}
                                onChange={(e) => handleFormChange('informative_text', e.target.value)}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                                        '&:hover fieldset': { borderColor: '#8B5CF6' },
                                        '&.Mui-focused fieldset': { borderColor: '#8B5CF6' }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ color: '#EC4899', mb: 2, fontWeight: 600 }}>
                                Configuração de Slots
                            </Typography>
                        </Grid>

                        {slotFields.map((field) => (
                            <Grid item xs={12} sm={6} md={4} key={field.key}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={`${field.icon} ${field.label}`}
                                    value={formData[field.key]}
                                    onChange={(e) => handleFormChange(field.key, e.target.value)}
                                    inputProps={{ min: 0, max: 100 }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                                            '&:hover fieldset': { borderColor: '#8B5CF6' },
                                            '&.Mui-focused fieldset': { borderColor: '#8B5CF6' }
                                        }
                                    }}
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1} mt={2}>
                                <InfoIcon sx={{ color: '#8B5CF6' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Total de Slots: {calculateTotalSlots(formData)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        startIcon={<CancelIcon />}
                        sx={{ color: '#6B7280' }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSaveTemplate}
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)'
                            }
                        }}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default NodewarTemplatesPage;
