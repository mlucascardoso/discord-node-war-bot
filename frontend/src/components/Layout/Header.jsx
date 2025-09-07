import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const Header = ({ currentPageTitle, onDrawerToggle, sidebarWidth = 280 }) => {
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

                <Avatar sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 32,
                    height: 32
                }}>
                    👻
                </Avatar>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
