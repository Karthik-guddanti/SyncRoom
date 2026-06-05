import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField, Box, Typography, Card, CardContent } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../context/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode || meetingCode.trim() === "") return;
        try {
            await addToUserHistory(meetingCode)
        } catch (e) {
            console.error("Failed to store meeting history:", e);
        }
        navigate(`/meet/${meetingCode}`)
    }

    let handleStartMeeting = async () => {
        const newCode = Math.random().toString(36).substring(2, 8);
        try {
            await addToUserHistory(newCode);
        } catch (e) {
            console.error("Failed to store meeting history:", e);
        }
        navigate(`/meet/${newCode}`);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="navBar" style={{ backgroundColor: '#0b0c10' }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>Sync<span>Room</span></h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <Button 
                        startIcon={<RestoreIcon />} 
                        onClick={() => navigate("/history")}
                        sx={{ color: 'text.primary', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}
                    >
                        History
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer" style={{ backgroundColor: '#0b0c10' }}>
                <div className="leftPanel">
                    <Box sx={{ maxWidth: '540px' }}>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
                            Seamless Meetings
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main', mb: 3, letterSpacing: '-0.5px' }}>
                            Whenever, Wherever.
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.05rem', lineHeight: 1.6 }}>
                            SyncRoom bridges distances with low-latency crystal clear video meetings. Start or join calls in seconds directly from your browser.
                        </Typography>

                        <Card 
                            variant="outlined" 
                            sx={{ 
                                background: 'rgba(20, 21, 31, 0.55)', 
                                backdropFilter: 'blur(12px)',
                                borderColor: 'rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                            }}
                        >
                            <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
                                <Box sx={{ display: 'flex', gap: "12px", alignItems: "center" }}>
                                    <TextField 
                                        onChange={e => setMeetingCode(e.target.value)} 
                                        id="meeting-code" 
                                        label="Enter Code" 
                                        variant="outlined" 
                                        placeholder="e.g. x8p12a" 
                                        fullWidth
                                    />
                                    <Button 
                                        onClick={handleJoinVideoCall} 
                                        variant='contained'
                                        disabled={!meetingCode.trim()}
                                        sx={{ 
                                            px: 4, 
                                            height: '56px',
                                            backgroundColor: 'primary.main',
                                            color: 'common.white',
                                            boxShadow: '0 10px 30px rgba(91, 124, 170, 0.18)',
                                            '&:hover': {
                                                backgroundColor: '#4d6a92'
                                            }
                                        }}
                                    >
                                        Join
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                                    <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                    <Typography variant="body2" sx={{ mx: 2, color: 'text.muted', fontWeight: 600 }}>OR</Typography>
                                    <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                </Box>

                                <Button 
                                    onClick={handleStartMeeting} 
                                    variant='contained' 
                                    color='secondary' 
                                    fullWidth
                                    sx={{ 
                                        height: '52px',
                                        backgroundColor: 'secondary.main',
                                        color: 'common.white',
                                        boxShadow: '0 10px 30px rgba(142, 166, 196, 0.18)',
                                        '&:hover': {
                                            backgroundColor: '#7a8fb1'
                                        }
                                    }}
                                >
                                    Start New Meeting
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </div>
                <div className='rightPanel'>
                    <img src='/meeting_hero.png' alt="SyncRoom Lobby" />
                </div>
            </div>
        </ThemeProvider>
    )
}

export default withAuth(HomeComponent)