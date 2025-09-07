import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Badge
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Games as GamesIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

const Sidebar = ({ currentPage, onMenuClick, botStatus }) => {
    const menuItems = [
        { id: 'welcome', label: 'Boas-vindas', icon: <DashboardIcon />, badge: null },
        { id: 'status', label: 'Status do Bot', icon: <InfoIcon />, badge: botStatus?.botReady ? 'online' : 'offline' },
        { id: 'nodewar', label: 'Node War', icon: <GamesIcon />, badge: null },
        { id: 'settings', label: 'Configurações', icon: <SettingsIcon />, badge: null },
    ];

    return (
        <Box sx={{ 
            width: 280,
            background: 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Logo da Guilda */}
            <Box 
                sx={{ 
                    height: 64, // Mesma altura do Toolbar
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 3,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    color: '#FFFFFF',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    👻 BANSHEE
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontStyle: 'italic', lineHeight: 1 }}>
                    Guilda Mística
                </Typography>
            </Box>

            {/* Menu Items */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ px: 1, py: 2 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => onMenuClick(item.id)}
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    backgroundColor: currentPage === item.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                    color: currentPage === item.id ? '#A78BFA' : '#B8B8B8',
                                    '&:hover': {
                                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                        color: '#A78BFA',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    color: currentPage === item.id ? '#A78BFA' : '#B8B8B8',
                                    minWidth: 40 
                                }}>
                                    {item.badge ? (
                                        <Badge 
                                            badgeContent=" " 
                                            color={item.badge === 'online' ? 'success' : 'error'}
                                            variant="dot"
                                        >
                                            {item.icon}
                                        </Badge>
                                    ) : (
                                        item.icon
                                    )}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: currentPage === item.id ? 600 : 500,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Bot Banshee v1.0
                </Typography>
            </Box>
        </Box>
    );
};

export default Sidebar;
