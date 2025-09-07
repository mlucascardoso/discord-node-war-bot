import { createTheme } from '@mui/material/styles';

// Tema personalizado para Banshee com cores mais sombrias e místicas
export const bansheeTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#8B5CF6', // Roxo místico
            dark: '#7C3AED',
            light: '#A78BFA'
        },
        secondary: {
            main: '#EC4899', // Rosa/magenta
            dark: '#DB2777',
            light: '#F472B6'
        },
        background: {
            default: '#0F0F0F', // Preto profundo
            paper: '#1A1A1A' // Cinza muito escuro
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B8B8B8'
        },
        error: {
            main: '#EF4444'
        },
        success: {
            main: '#10B981'
        },
        warning: {
            main: '#F59E0B'
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700
        },
        h2: {
            fontWeight: 600
        },
        h3: {
            fontWeight: 600
        }
    }
});
