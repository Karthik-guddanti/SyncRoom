import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <header className='landingHeader'>
                <div className='navHeader'>
                    <h2>Sync<span>Room</span></h2>
                </div>
                <nav className='navlist'>
                    <span className='navLink' onClick={() => {
                        const randomCode = Math.random().toString(36).substring(2, 8);
                        router(`/meet/${randomCode}`);
                    }}>Join as Guest</span>
                    <span className='navLink' onClick={() => router("/auth")}>Register</span>
                    <button className='loginBtn' onClick={() => router("/auth")}>Login</button>
                </nav>
            </header>

            <main className="landingMainContainer">
                <div className="heroTextSection">
                    <h1 className="heroTitle">
                        Connect with your <br />
                        <span className="gradientText">Loved Ones</span>
                    </h1>
                    <p className="heroSubtitle">
                        Bridge any distance with SyncRoom. High-definition, low-latency video meetings built for smooth communication and real-time collaboration.
                    </p>
                    <div className="ctaContainer">
                        <Link to="/auth" className="ctaButton">Get Started</Link>
                    </div>
                </div>
                <div className="heroImageSection">
                    <div className="imageGlowWrapper">
                        <img src="/meeting_hero.png" alt="SyncRoom Video Meeting" className="heroImage" />
                    </div>
                </div>
            </main>
        </div>
    )
}
