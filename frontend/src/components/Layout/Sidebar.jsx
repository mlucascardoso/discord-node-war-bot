import React, { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Badge,
    IconButton,
    Tooltip,
    Collapse
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Games as GamesIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Terminal as TerminalIcon,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';

const Sidebar = ({ currentPage, onMenuClick, botStatus, isCollapsed, onToggleCollapse }) => {
    const [commandsOpen, setCommandsOpen] = useState(true);

    const menuItems = [
        { id: 'welcome', label: 'Boas-vindas', icon: <DashboardIcon />, badge: null },
        { 
            id: 'commands', 
            label: 'Comandos BOT', 
            icon: <TerminalIcon />, 
            badge: null,
            isSubmenu: true,
            children: [
                { id: 'status', label: 'Status do Bot', icon: <InfoIcon />, badge: botStatus?.botReady ? 'online' : 'offline' },
                { id: 'nodewar', label: 'Node War', icon: <GamesIcon />, badge: null },
            ]
        },
        { id: 'settings', label: 'Configurações', icon: <SettingsIcon />, badge: null },
    ];

    const handleCommandsToggle = () => {
        setCommandsOpen(!commandsOpen);
    };

    const sidebarWidth = isCollapsed ? 72 : 280;

    return (
        <Box sx={{ 
            width: sidebarWidth,
            background: 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
        }}>
            {/* Logo da Guilda */}
            <Box 
                sx={{ 
                    height: 64, // Mesma altura do Toolbar
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: isCollapsed ? 0.5 : 3,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    color: '#FFFFFF',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {!isCollapsed ? (
                    <>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            👻 BANSHEE
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontStyle: 'italic', lineHeight: 1 }}>
                            Guilda Mística
                        </Typography>
                    </>
                ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, mr: 2 }}>
                        👻
                    </Typography>
                )}
                
                {/* Botão de Toggle */}
                <IconButton
                    onClick={onToggleCollapse}
                    sx={{
                        position: 'absolute',
                        right: isCollapsed ? 2 : 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        width: 20,
                        height: 20,
                        minWidth: 20,
                        padding: 0,
                        zIndex: 1,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }
                    }}
                >
                    {isCollapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
                </IconButton>
            </Box>

            {/* Menu Items */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ px: 1, py: 2 }}>
                    {menuItems.map((item) => (
                        <React.Fragment key={item.id}>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip 
                                    title={isCollapsed ? item.label : ''}
                                    placement="right"
                                    arrow
                                >
                                    <ListItemButton
                                        onClick={item.isSubmenu ? handleCommandsToggle : () => onMenuClick(item.id)}
                                        sx={{
                                            borderRadius: 2,
                                            mx: 1,
                                            minHeight: 48,
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                            px: isCollapsed ? 1 : 2,
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
                                            minWidth: isCollapsed ? 0 : 40,
                                            mr: isCollapsed ? 0 : 1
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
                                        {!isCollapsed && (
                                            <>
                                                <ListItemText 
                                                    primary={item.label}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: currentPage === item.id ? 600 : 500,
                                                    }}
                                                />
                                                {item.isSubmenu && (
                                                    commandsOpen ? <ExpandLess /> : <ExpandMore />
                                                )}
                                            </>
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                            
                            {/* Submenu Items */}
                            {item.isSubmenu && item.children && (
                                <>
                                    {/* Submenu expandido quando não colapsado */}
                                    <Collapse in={commandsOpen && !isCollapsed} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.children.map((childItem) => (
                                                <ListItem key={childItem.id} disablePadding sx={{ mb: 0.5 }}>
                                                    <ListItemButton
                                                        onClick={() => onMenuClick(childItem.id)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            mx: 1,
                                                            ml: 3,
                                                            minHeight: 40,
                                                            px: 2,
                                                            backgroundColor: currentPage === childItem.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                                            color: currentPage === childItem.id ? '#A78BFA' : '#B8B8B8',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                                color: '#A78BFA',
                                                            },
                                                        }}
                                                    >
                                                        <ListItemIcon sx={{ 
                                                            color: currentPage === childItem.id ? '#A78BFA' : '#B8B8B8',
                                                            minWidth: 32,
                                                            mr: 1
                                                        }}>
                                                            {childItem.badge ? (
                                                                <Badge 
                                                                    badgeContent=" " 
                                                                    color={childItem.badge === 'online' ? 'success' : 'error'}
                                                                    variant="dot"
                                                                >
                                                                    {childItem.icon}
                                                                </Badge>
                                                            ) : (
                                                                childItem.icon
                                                            )}
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={childItem.label}
                                                            primaryTypographyProps={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: currentPage === childItem.id ? 600 : 500,
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                    
                                    {/* Itens do submenu como tooltips quando colapsado */}
                                    {isCollapsed && item.children.map((childItem) => (
                                        <ListItem key={`collapsed-${childItem.id}`} disablePadding sx={{ mb: 0.5 }}>
                                            <Tooltip 
                                                title={childItem.label}
                                                placement="right"
                                                arrow
                                            >
                                                <ListItemButton
                                                    onClick={() => onMenuClick(childItem.id)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        mx: 1,
                                                        minHeight: 40,
                                                        justifyContent: 'center',
                                                        px: 1,
                                                        backgroundColor: currentPage === childItem.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                                        color: currentPage === childItem.id ? '#A78BFA' : '#B8B8B8',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                            color: '#A78BFA',
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ 
                                                        color: currentPage === childItem.id ? '#A78BFA' : '#B8B8B8',
                                                        minWidth: 0,
                                                        mr: 0
                                                    }}>
                                                        {childItem.badge ? (
                                                            <Badge 
                                                                badgeContent=" " 
                                                                color={childItem.badge === 'online' ? 'success' : 'error'}
                                                                variant="dot"
                                                            >
                                                                {childItem.icon}
                                                            </Badge>
                                                        ) : (
                                                            childItem.icon
                                                        )}
                                                    </ListItemIcon>
                                                </ListItemButton>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* Footer */}
            {!isCollapsed && (
                <Box sx={{ p: 2, borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                        Bot Banshee v1.0
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default Sidebar;
