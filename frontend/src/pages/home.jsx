import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../context/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        if (!meetingCode || meetingCode.trim() === "") return;
        await addToUserHistory(meetingCode)
        navigate(`/meet/${meetingCode}`)
    }

    let handleStartMeeting = async () => {
        const newCode = Math.random().toString(36).substring(2, 8);
        await addToUserHistory(newCode);
        navigate(`/meet/${newCode}`);
    }

    return (
        <>

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2>SyncRoom</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>

                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{ display: 'flex', gap: "10px", alignItems: "center" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" placeholder="e.g. x8p12a" />
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>

                        <div style={{ display: 'flex', gap: "10px", alignItems: "center", marginTop: "1.5rem" }}>
                            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>OR</span>
                            <Button onClick={handleStartMeeting} variant='contained' color='secondary'>Start New Meeting</Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </>
    )
}


export default withAuth(HomeComponent)