import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';

// Theme
import { bansheeTheme } from './theme/bansheeTheme';

// Layout Components
import Layout from './components/Layout/Layout';
import AlertMessage from './components/UI/AlertMessage';

// Page Components
import WelcomePage from './components/Pages/WelcomePage';
import BotStatusPage from './components/Pages/BotStatusPage';
import NodeWarPage from './components/Pages/NodeWarPage';
import SettingsPage from './components/Pages/SettingsPage';

// Hooks
import { useApi } from './hooks/useApi';

function App() {
    const [currentPage, setCurrentPage] = useState('welcome');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [message, setMessage] = useState(null);

    const isMobile = useMediaQuery(bansheeTheme.breakpoints.down('md'));
    
    // Use API hook
    const {
        botStatus,
        channels,
        loading,
        fetchBotStatus,
        fetchChannels,
        executeNodeWar: apiExecuteNodeWar
    } = useApi();

    const menuItems = [
        { id: 'welcome', label: 'Boas-vindas' },
        { id: 'status', label: 'Status do Bot' },
        { id: 'nodewar', label: 'Node War' },
        { id: 'settings', label: 'Configurações' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuClick = (pageId) => {
        setCurrentPage(pageId);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleExecuteNodeWar = async () => {
        const result = await apiExecuteNodeWar(selectedChannel);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
        } else {
            setMessage({ type: 'error', text: result.error });
        }
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'welcome':
                return <WelcomePage />;
            case 'status':
                return <BotStatusPage botStatus={botStatus} fetchBotStatus={fetchBotStatus} />;
            case 'nodewar':
                return <NodeWarPage 
                    channels={channels}
                    selectedChannel={selectedChannel}
                    setSelectedChannel={setSelectedChannel}
                    executeNodeWar={handleExecuteNodeWar}
                    loading={loading}
                    fetchChannels={fetchChannels}
                />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <WelcomePage />;
        }
    };

    const getCurrentPageTitle = () => {
        const currentMenuItem = menuItems.find(item => item.id === currentPage);
        return currentMenuItem?.label || 'Banshee Bot';
    };

    return (
        <ThemeProvider theme={bansheeTheme}>
            <CssBaseline />
            <Layout
                currentPage={currentPage}
                onMenuClick={handleMenuClick}
                mobileOpen={mobileOpen}
                onDrawerToggle={handleDrawerToggle}
                botStatus={botStatus}
                currentPageTitle={getCurrentPageTitle()}
            >
                <AlertMessage 
                    message={message} 
                    onClose={() => setMessage(null)} 
                />
                {renderCurrentPage()}
            </Layout>
        </ThemeProvider>
    );
}

export default App;
