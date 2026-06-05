import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideocamIcon from '@mui/icons-material/Videocam';
import HistoryIcon from '@mui/icons-material/History';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { IconButton, Button, Box, Grid, Container, Tooltip } from '@mui/material';

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
});

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (err) {
                console.error("Failed to fetch user history", err);
            }
        }
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleCopy = (code, index) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ minHeight: '100vh', backgroundColor: '#0b0c10', color: 'text.primary', pb: 6 }}>
                <Box className="navBar" sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <IconButton 
                            onClick={() => routeTo("/home")}
                            sx={{ color: 'primary.main', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                        >
                            <HomeIcon />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 800, ml: 1 }}>
                            Meeting History
                        </Typography>
                    </Box>
                </Box>

                <Container sx={{ mt: 5 }}>
                    {meetings.length !== 0 ? (
                        <Grid container spacing={3}>
                            {meetings.map((meeting, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card 
                                        variant="outlined" 
                                        sx={{ 
                                            background: 'rgba(20, 21, 31, 0.65)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '20px',
                                            borderColor: 'rgba(255,255,255,0.08)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                borderColor: 'primary.main',
                                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                        MEETING CODE
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                                                        {meeting.meetingCode}
                                                    </Typography>
                                                </Box>
                                                <Tooltip title={copiedIndex === index ? "Copied!" : "Copy Code"}>
                                                    <IconButton 
                                                        onClick={() => handleCopy(meeting.meetingCode, index)}
                                                        sx={{ color: copiedIndex === index ? 'success.main' : 'text.secondary', backgroundColor: 'rgba(255,255,255,0.04)' }}
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>

                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                                Held on: <strong>{formatDate(meeting.date)}</strong>
                                            </Typography>

                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<VideocamIcon />}
                                                onClick={() => routeTo(`/meet/${meeting.meetingCode}`)}
                                                sx={{ 
                                                    borderRadius: '10px', 
                                                    textTransform: 'none', 
                                                    borderColor: 'rgba(99, 102, 241, 0.4)',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'white',
                                                        borderColor: 'primary.main',
                                                    }
                                                }}
                                            >
                                                Rejoin Meeting
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                            <HistoryIcon sx={{ fontSize: 80, color: 'text.muted', mb: 2, opacity: 0.5 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                No Meetings Yet
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '360px', mb: 3 }}>
                                Meetings you join or host will appear here. Start a call from the lobby dashboard to get started!
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => routeTo("/home")}
                                sx={{ borderRadius: '12px', backgroundColor: 'primary.main', '&:hover': { backgroundColor: '#4d6a92' } }}
                            >
                                Back to Lobby
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    )
}
