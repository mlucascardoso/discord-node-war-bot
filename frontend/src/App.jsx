import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';

// Theme
import { bansheeTheme } from './theme/bansheeTheme';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout Components
import Layout from './components/Layout/Layout';
import AlertMessage from './components/UI/AlertMessage';

// Page Components
import DashboardPage from './components/Pages/DashboardPage';
import BotStatusPage from './components/Pages/BotStatusPage';
import NodeWarPage from './components/Pages/NodeWarPage';
import NodewarTemplatesPage from './components/Pages/NodewarTemplatesPage';
import MembersPage from './components/Pages/MembersPage';
import SettingsPage from './components/Pages/SettingsPage';

// Hooks
import { useDiscordBot } from './hooks/useDiscordBot';

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
        executeNodeWar: apiExecuteNodeWar,
        startBot,
        stopBot,
        restartBot,
        fetchRoles,
        fetchMemberRoles,
        updateMemberRoles
    } = useDiscordBot();

    const menuItems = [
        { id: 'welcome', label: 'Boas-vindas' },
        { id: 'status', label: 'Status do Bot' },
        { id: 'nodewar', label: 'Node War' },
        { id: 'templates', label: 'Templates NodeWar' },
        { id: 'members', label: 'Membros' },
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
                return <DashboardPage />;
            case 'status':
                return <BotStatusPage 
                    botStatus={botStatus} 
                    fetchBotStatus={fetchBotStatus}
                    startBot={startBot}
                    stopBot={stopBot}
                    loading={loading}
                    setMessage={setMessage}
                />;
            case 'nodewar':
                return <NodeWarPage 
                    channels={channels}
                    selectedChannel={selectedChannel}
                    setSelectedChannel={setSelectedChannel}
                    executeNodeWar={handleExecuteNodeWar}
                    loading={loading}
                    fetchChannels={fetchChannels}
                />;
            case 'templates':
                return <NodewarTemplatesPage />;
            case 'members':
                return <MembersPage 
                    fetchRoles={fetchRoles}
                    fetchMemberRoles={fetchMemberRoles}
                    updateMemberRoles={updateMemberRoles}
                    setMessage={setMessage}
                />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <DashboardPage />;
        }
    };

    const getCurrentPageTitle = () => {
        const currentMenuItem = menuItems.find(item => item.id === currentPage);
        return currentMenuItem?.label || 'Banshee Bot';
    };

    return (
        <ThemeProvider theme={bansheeTheme}>
            <CssBaseline />
            <AuthProvider>
                <ProtectedRoute>
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
                </ProtectedRoute>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
