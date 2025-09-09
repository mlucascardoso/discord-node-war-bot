import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { getAllMembers, getMembersStats } from '../../api/members.js';

const DashboardPage = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('all');
    const [evolutionData, setEvolutionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carregar dados dos membros da API
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const membersData = await getAllMembers();
                setMembers(membersData);

                // Mock data para evolução (dados históricos simulados baseados nos membros reais)
                const mockEvolution = [
                    { month: 'Jan', ...membersData.reduce((acc, member) => ({ ...acc, [member.family_name]: member.gearscore - 15 }), {}) },
                    { month: 'Fev', ...membersData.reduce((acc, member) => ({ ...acc, [member.family_name]: member.gearscore - 10 }), {}) },
                    { month: 'Mar', ...membersData.reduce((acc, member) => ({ ...acc, [member.family_name]: member.gearscore - 5 }), {}) },
                    { month: 'Abr', ...membersData.reduce((acc, member) => ({ ...acc, [member.family_name]: member.gearscore - 2 }), {}) },
                    { month: 'Mai', ...membersData.reduce((acc, member) => ({ ...acc, [member.family_name]: member.gearscore }), {}) }
                ];
                setEvolutionData(mockEvolution);
            } catch (err) {
                console.error('Error fetching members:', err);
                setError('Erro ao carregar dados dos membros');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Calcular estatísticas
    const totalMembers = members.length;
    const averageGearscore = members.length > 0 
        ? Math.round(members.reduce((sum, member) => sum + member.gearscore, 0) / members.length)
        : 0;
    const highestGearscore = members.length > 0 
        ? Math.max(...members.map(m => m.gearscore))
        : 0;
    const topPlayer = members.find(m => m.gearscore === highestGearscore);

    // Dados para gráfico de barras (média geral)
    const gearscoreData = members.map(member => ({
        name: member.family_name,
        gearscore: member.gearscore
    }));

    // Cores para os gráficos
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

    // Dados para gráfico de pizza (distribuição por classe) - usando class_id temporariamente
    const classDistribution = members.reduce((acc, member) => {
        const className = `Classe ${member.class_id || 'N/A'}`;
        acc[className] = (acc[className] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(classDistribution).map(([className, count], index) => ({
        name: className,
        value: count,
        fill: colors[index % colors.length]
    }));

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Carregando dados dos membros...
                </Typography>
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
                📊 Dashboard de Membros
            </Typography>

            {/* Cards de Estatísticas */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h4" component="div">
                                    {totalMembers}
                                </Typography>
                                <Typography variant="body2">
                                    Total de Membros
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h4" component="div">
                                    {averageGearscore}
                                </Typography>
                                <Typography variant="body2">
                                    Gearscore Médio
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h4" component="div">
                                    {highestGearscore}
                                </Typography>
                                <Typography variant="body2">
                                    Maior Gearscore
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h6" component="div">
                                    {topPlayer?.familyName}
                                </Typography>
                                <Typography variant="body2">
                                    Top Player
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Gráfico de Gearscore por Membro */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, background: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                            🎯 Gearscore por Membro
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gearscoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value, name, props) => [
                                        `${value} GS`,
                                        `${props.payload.character} (${props.payload.class})`
                                    ]}
                                    labelFormatter={(label) => `Família: ${label}`}
                                />
                                <Bar dataKey="gearscore" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Gráfico de Pizza - Distribuição por Classe */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, background: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                            ⚔️ Distribuição por Classe
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Gráfico de Evolução Individual */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, background: 'background.paper' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                📈 Evolução de Gearscore ao Longo do Tempo
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Filtrar Membro</InputLabel>
                                <Select
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    label="Filtrar Membro"
                                >
                                    <MenuItem value="all">Todos</MenuItem>
                                    {members.map(member => (
                                        <MenuItem key={member.id} value={member.family_name}>
                                            {member.family_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {(selectedMember === 'all' ? members : members.filter(m => m.family_name === selectedMember))
                                    .map((member, index) => (
                                    <Line
                                        key={member.family_name}
                                        type="monotone"
                                        dataKey={member.family_name}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Legenda de Cálculo */}
            <Paper sx={{ p: 2, mt: 3, background: 'background.paper' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    💡 <strong>Fórmula do Gearscore:</strong> ((AP + AP Despertar) / 2) + DP
                </Typography>
            </Paper>
        </Box>
    );
};

export default DashboardPage;
