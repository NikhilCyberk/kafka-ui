import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
            light: '#ff5983',
            dark: '#9a0036',
        },
        background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
            primary: mode === 'light' ? '#000000' : '#ffffff',
            secondary: mode === 'light' ? '#666666' : '#b0b0b0',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: mode === 'light' 
                        ? '0 2px 8px rgba(0,0,0,0.1)' 
                        : '0 2px 8px rgba(0,0,0,0.3)',
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: mode === 'light' 
                        ? '0 2px 8px rgba(0,0,0,0.1)' 
                        : '0 2px 8px rgba(0,0,0,0.3)',
                    border: '1px solid',
                    borderColor: 'divider',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1976d2',
                    '& .MuiTableCell-head': {
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderBottom: '2px solid',
                        borderColor: '#1565c0',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(odd)': {
                        backgroundColor: mode === 'light' 
                            ? 'rgba(0, 0, 0, 0.02)' 
                            : 'rgba(255, 255, 255, 0.02)',
                    },
                    '&:hover': {
                        backgroundColor: mode === 'light' 
                            ? 'rgba(0, 0, 0, 0.04)' 
                            : 'rgba(255, 255, 255, 0.04)',
                        transition: 'background-color 0.2s ease',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    padding: '12px 16px',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: '0.875rem',
                    },
                },
            },
        },
    },
});

// Default theme for backward compatibility
const theme = getTheme('light');

export { getTheme };
export default theme; 