import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import { Snackbar } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1',
        },
        secondary: {
            main: '#ec4899',
        },
        background: {
            default: '#0b0c10',
            paper: '#14151f',
        },
        text: {
            primary: '#f3f4f6',
            secondary: '#a3a3c2',
        }
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(20, 21, 31, 0.4)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 20px',
                },
            },
        },
    },
});

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            console.log(err);
            let errMsg = err.response?.data?.message || "An error occurred";
            setError(errMsg);
        }
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Grid container component="main" sx={{ height: '100vh', backgroundColor: '#0b0c10' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(20, 21, 31, 1) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 4,
                        textAlign: 'center',
                        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '20%',
                        left: '20%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
                        filter: 'blur(50px)',
                        zIndex: 0,
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: '20%',
                        right: '10%',
                        width: '250px',
                        height: '250px',
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(0,0,0,0) 70%)',
                        filter: 'blur(40px)',
                        zIndex: 0,
                    }} />

                    <Box sx={{ zIndex: 1, maxWidth: '480px' }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                            Welcome to SyncRoom
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            Connect instantly with friends, teammates, and clients. HD latency-free video conferencing designed for elegant communication.
                        </Typography>
                    </Box>
                </Grid>

                <Grid 
                    item 
                    xs={12} 
                    sm={8} 
                    md={5} 
                    component={Paper} 
                    elevation={0} 
                    square 
                    sx={{ 
                        background: '#0d0e15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '400px',
                            backgroundColor: 'rgba(20, 21, 31, 0.6)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            padding: '40px 30px',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56, boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 1, mb: 3 }}>
                            {formState === 0 ? "Sign In" : "Sign Up"}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 3, p: 0.5, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '14px' }}>
                            <Button 
                                fullWidth 
                                variant={formState === 0 ? "contained" : "text"} 
                                onClick={() => { setFormState(0); setError(""); }}
                                sx={{ 
                                    borderRadius: '10px', 
                                    color: formState === 0 ? 'common.white' : 'text.secondary',
                                    backgroundColor: formState === 0 ? 'primary.main' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: formState === 0 ? '#4d6a92' : 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Sign In
                            </Button>
                            <Button 
                                fullWidth 
                                variant={formState === 1 ? "contained" : "text"} 
                                onClick={() => { setFormState(1); setError(""); }}
                                sx={{ 
                                    borderRadius: '10px', 
                                    color: formState === 1 ? 'common.white' : 'text.secondary',
                                    backgroundColor: formState === 1 ? 'secondary.main' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: formState === 1 ? '#7a8fb1' : 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>
                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoComplete="name"
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoComplete="username"
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && (
                                <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center', fontWeight: 500 }}>
                                    {error}
                                </Typography>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 4, 
                                    mb: 2,
                                    backgroundColor: formState === 0 ? 'primary.main' : 'secondary.main',
                                    color: 'common.white',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)',
                                    '&:hover': {
                                        backgroundColor: formState === 0 ? '#4d6a92' : '#7a8fb1',
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />
        </ThemeProvider>
    );
}