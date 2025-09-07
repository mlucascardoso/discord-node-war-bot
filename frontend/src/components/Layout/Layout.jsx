import React, { useState } from 'react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const sidebarWidth = isCollapsed ? 72 : 280;

    const drawer = <Sidebar 
        currentPage={currentPage} 
        onMenuClick={onMenuClick} 
        botStatus={botStatus}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
    />;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header 
            currentPageTitle={currentPageTitle}
            onDrawerToggle={onDrawerToggle}
            sidebarWidth={sidebarWidth}
        />

        {/* Drawer */}
        <Box
            component="nav"
            sx={{ width: { md: sidebarWidth }, flexShrink: { md: 0 } }}
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
                        width: 280, // Mobile sempre expandido
                        border: 'none',
                    },
                }}
            >
                <Sidebar 
                    currentPage={currentPage} 
                    onMenuClick={onMenuClick} 
                    botStatus={botStatus}
                    isCollapsed={false} // Mobile sempre expandido
                    onToggleCollapse={() => {}} // No-op no mobile
                />
            </Drawer>
            
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: sidebarWidth,
                        border: 'none',
                        transition: 'width 0.3s ease',
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
                width: { md: `calc(100% - ${sidebarWidth}px)` },
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #0F0F0F 0%, #1A0F2E 100%)',
                transition: 'width 0.3s ease',
            }}
        >
            <Toolbar />
            {children}
        </Box>
        </Box>
    );
};

export default Layout;
