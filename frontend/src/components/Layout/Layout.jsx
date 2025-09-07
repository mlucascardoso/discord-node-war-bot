import React from 'react';
import {
    Box,
    Drawer,
    Toolbar,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ 
    children, 
    currentPage, 
    onMenuClick, 
    mobileOpen, 
    onDrawerToggle, 
    botStatus,
    currentPageTitle 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawer = <Sidebar 
        currentPage={currentPage} 
        onMenuClick={onMenuClick} 
        botStatus={botStatus} 
    />;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Header 
                currentPageTitle={currentPageTitle}
                onDrawerToggle={onDrawerToggle}
            />

            {/* Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={onDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: 280,
                            border: 'none',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: 280,
                            border: 'none',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - 280px)` },
                    minHeight: '100vh',
                    background: 'linear-gradient(180deg, #0F0F0F 0%, #1A0F2E 100%)',
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
