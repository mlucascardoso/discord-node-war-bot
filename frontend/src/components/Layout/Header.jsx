import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import { 
    Menu as MenuIcon,
    Logout as LogoutIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ currentPageTitle, onDrawerToggle, sidebarWidth = 280 }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { logout } = useAuth();
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - ${sidebarWidth}px)` },
                ml: { md: `${sidebarWidth}px` },
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                transition: 'width 0.3s ease, margin-left 0.3s ease',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onDrawerToggle}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    {currentPageTitle}
                </Typography>

                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                    <Avatar sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 32,
                        height: 32,
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                        }
                    }}>
                        👻
                    </Avatar>
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 8,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            backgroundColor: 'rgba(15, 15, 15, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'rgba(15, 15, 15, 0.95)',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderBottom: 'none',
                                borderRight: 'none',
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem sx={{ color: '#B8B8B8', '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' } }}>
                        <ListItemIcon>
                            <PersonIcon sx={{ color: '#8B5CF6' }} />
                        </ListItemIcon>
                        <ListItemText>
                            bansheeAdmin
                        </ListItemText>
                    </MenuItem>
                    <Divider sx={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />
                    <MenuItem 
                        onClick={handleLogout}
                        sx={{ 
                            color: '#EF4444', 
                            '&:hover': { 
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#FCA5A5'
                            } 
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon sx={{ color: '#EF4444' }} />
                        </ListItemIcon>
                        <ListItemText>
                            Sair da Guilda
                        </ListItemText>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
