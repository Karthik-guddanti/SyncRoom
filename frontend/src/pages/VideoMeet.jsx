import React, { useEffect, useRef, useState, useContext } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Typography, Box } from '@mui/material';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
            default: '#0a0b10',
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

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    const [copied, setCopied] = useState(false);
    let meetingId = window.location.pathname.replace("/meet/", "");

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState(() => {
        return userData?.name || userData?.username || "";
    });

    useEffect(() => {
        if (userData && (userData.name || userData.username)) {
            setUsername(userData.name || userData.username);
        }
    }, [userData]);

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        getPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        let videoAccess = false;
        let audioAccess = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoAccess = true;
            audioAccess = true;
            window.localStream = stream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }
        } catch (err) {
            // If both fail, try audio only as fallback
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioAccess = true;
                window.localStream = audioStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = audioStream;
                }
            } catch (audioErr) {
                console.error("Audio and Video permissions denied.");
            }
        }

        setVideoAvailable(videoAccess);
        setAudioAvailable(audioAccess);

        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }
    };

    // Removed problematic useEffect that recreated stream on every toggle
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        getUserMedia();
        connectToSocketServer();
    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            try {
                const senders = connections[id].getSenders();
                senders.forEach(sender => connections[id].removeTrack(sender));
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });
            } catch (e) {
                console.log(e);
            }

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                try {
                    const senders = connections[id].getSenders();
                    senders.forEach(sender => connections[id].removeTrack(sender));
                    window.localStream.getTracks().forEach(track => {
                        connections[id].addTrack(track, window.localStream);
                    });
                } catch (e) {
                    console.log(e);
                }

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            try {
                const senders = connections[id].getSenders();
                senders.forEach(sender => connections[id].removeTrack(sender));
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });
            } catch (e) {
                console.log(e);
            }

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', meetingId)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    // Skip itself
                    if (socketListId === socketIdRef.current) return;

                    // If this client is NOT the joining client, ONLY connect to the joining client.
                    // Do not recreate existing connection objects for others.
                    if (id !== socketIdRef.current && socketListId !== id) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video track/stream
                    connections[socketListId].ontrack = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        const remoteStream = event.streams[0];
                        if (!remoteStream) return;

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: remoteStream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: remoteStream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    // Add local tracks to the connection
                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            const senders = connections[id2].getSenders();
                            senders.forEach(sender => connections[id2].removeTrack(sender));
                            window.localStream.getTracks().forEach(track => {
                                connections[id2].addTrack(track, window.localStream);
                            });
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        let stream = localVideoref.current.srcObject;
        if (stream && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].enabled = !video;
        }
    }
    let handleAudio = () => {
        setAudio(!audio)
        let stream = localVideoref.current.srcObject;
        if (stream && stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].enabled = !audio;
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        if (localStorage.getItem("token")) {
            navigate("/home");
        } else {
            navigate("/");
        }
    }



    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        if (!message || message.trim() === "") return;
        socketRef.current.emit('chat-message', message.trim(), username)
        setMessage("");
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <ThemeProvider theme={darkTheme}>
            <div className={styles.meetVideoContainer}>

                {askForUsername === true ?
                    <div className={styles.lobbyContainer}>
                        <div className={styles.lobbyCard}>
                            <h2>Enter Lobby</h2>
                            <p>Verify your camera and enter your display name to join the meeting room.</p>
                            
                            <div className={styles.lobbyVideoWrapper}>
                                <video ref={localVideoref} autoPlay muted></video>
                            </div>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField 
                                    id="username-lobby" 
                                    label="Your Name" 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                    variant="outlined"
                                    fullWidth
                                    autoFocus
                                    placeholder="Enter username"
                                />
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={connect}
                                    disabled={!username || !username.trim()}
                                    sx={{ 
                                        py: 1.5,
                                        fontSize: '1rem',
                                        backgroundColor: 'primary.main',
                                        color: 'common.white',
                                        boxShadow: '0 10px 28px rgba(91, 124, 170, 0.18)',
                                        '&:hover': {
                                            backgroundColor: '#4d6a92',
                                        }
                                    }}
                                >
                                    Join Meeting
                                </Button>
                            </Box>
                        </div>
                    </div> :

                    <div className={styles.mainMeetingArea}>
                        {/* Header Meeting Info */}
                        <div style={{ 
                            position: "absolute", 
                            top: "20px", 
                            left: "20px", 
                            backgroundColor: "rgba(20,21,31,0.75)", 
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "white", 
                            padding: "8px 16px", 
                            borderRadius: "12px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            zIndex: 10 
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Meeting ID: <strong>{meetingId}</strong></Typography>
                            <IconButton size="small" style={{ color: "white" }} onClick={() => {
                                navigator.clipboard.writeText(meetingId);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            {copied && <Typography variant="caption" style={{ color: "#10b981", fontWeight: 600 }}>Copied!</Typography>}
                        </div>

                        {/* Slide drawer for Chat */}
                        {showModal ? 
                            <div className={styles.chatRoom}>
                                <div className={styles.chatContainer}>
                                    <div className={styles.chatHeader}>Meeting Chat</div>

                                    <div className={styles.chattingDisplay}>
                                        {messages.length !== 0 ? messages.map((item, index) => (
                                            <div className={styles.chatMessage} key={index}>
                                                <div className={styles.chatSender}>{item.sender}</div>
                                                <div className={styles.chatText}>{item.data}</div>
                                            </div>
                                        )) : <p className={styles.noMessages}>No Messages Yet</p>}
                                    </div>

                                    <div className={styles.chattingArea}>
                                        <TextField 
                                            value={message} 
                                            onChange={(e) => setMessage(e.target.value)} 
                                            id="chat-input" 
                                            label="Chat Message" 
                                            variant="outlined" 
                                            size="small"
                                            fullWidth
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        <Button 
                                            variant='contained' 
                                            onClick={sendMessage}
                                            sx={{ minWidth: '70px', height: '40px' }}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </div> : <></>
                        }

                        {/* Floating Buttons Menu Control */}
                        <div className={styles.buttonContainers}>
                            <IconButton 
                                onClick={handleVideo} 
                                style={{ 
                                    color: "white", 
                                    backgroundColor: video === true ? "rgba(255, 255, 255, 0.08)" : "#ef4444", 
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    transition: "all 0.2s"
                                }}
                            >
                                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>

                            <IconButton 
                                onClick={handleAudio} 
                                style={{ 
                                    color: "white", 
                                    backgroundColor: audio === true ? "rgba(255, 255, 255, 0.08)" : "#ef4444", 
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    transition: "all 0.2s"
                                }}
                            >
                                {audio === true ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>

                            {screenAvailable === true ?
                                <IconButton 
                                    onClick={handleScreen} 
                                    style={{ 
                                        color: "white", 
                                        backgroundColor: screen === true ? "#10b981" : "rgba(255,255,255,0.08)", 
                                        boxShadow: screen === true ? "0 4px 15px rgba(16, 185, 129, 0.4)" : "none",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                </IconButton> : <></>
                            }

                            <Badge badgeContent={newMessages} max={99} color='secondary'>
                                <IconButton 
                                    onClick={() => {
                                        setModal(!showModal);
                                        setNewMessages(0);
                                    }} 
                                    style={{ 
                                        color: "white", 
                                        backgroundColor: showModal ? "#6366f1" : "rgba(255,255,255,0.08)",
                                        boxShadow: showModal ? "0 4px 15px rgba(99, 102, 241, 0.4)" : "none",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Badge>

                            <IconButton 
                                onClick={handleEndCall} 
                                style={{ 
                                    color: "white", 
                                    backgroundColor: "#ef4444", 
                                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                                    marginLeft: "8px",
                                    transition: "all 0.2s"
                                }}
                            >
                                <CallEndIcon />
                            </IconButton>
                        </div>

                        {/* Floating Local User Video preview */}
                        <video className={`${styles.meetUserVideo} ${showModal ? styles.meetUserVideoWithChat : ''}`} ref={localVideoref} autoPlay muted></video>

                        {/* Remote Video stream tiles grid */}
                        <div className={styles.conferenceView}>
                            {videos.map((video) => (
                                <div className={styles.videoTile} key={video.socketId}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                    />
                                    <div className={styles.participantBadge}>
                                        User: {video.socketId.substring(0, 5)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </ThemeProvider>
    )
}
