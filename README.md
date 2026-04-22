# Sync Room

## Description
Sync Room is a comprehensive, real-time video meeting application built to provide high-quality video, audio, and chat communication. It features secure user authentication, meeting history tracking, and an intuitive UI to create or join dynamic WebRTC-powered mesh meeting rooms. 

## Tech Stack
* **Frontend:** React, Material-UI, Axios
* **Backend:** Node.js, Express
* **Database:** MongoDB, Mongoose
* **Real-time Communication:** WebSockets (Socket.io), WebRTC
* **Authentication:** JSON Web Tokens (JWT), bcrypt

## Features
* **User Authentication:** Secure registration and login flow with encrypted passwords.
* **Video/Audio Calling:** Seamless, low-latency peer-to-peer media streams utilizing WebRTC.
* **Meeting Rooms:** Unique auto-generated room links to securely isolate communication between peers.
* **Real-Time Chat:** Integrated text chat within meeting rooms to communicate without interrupting the audio stream.
* **Meeting History:** Automatically tracks and saves the meeting codes that users create or join to their profile.

## Project Structure
```text
SyncRoom/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Route logic & Socket.io manager
│   │   ├── middlewares/  # JWT Auth & Error Handling
│   │   ├── models/       # Mongoose schemas (User, Meeting)
│   │   ├── routes/       # Express API routes
│   │   ├── app.js        # Express app configuration
│   │   └── server.js     # Server entry point
│   └── .env              # Backend environment variables
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── context/      # React Context (AuthContext)
    │   ├── pages/        # Main route views (Home, VideoMeet, Auth, History)
    │   ├── styles/       # Modular CSS files
    │   ├── utils/        # Higher Order Components (withAuth)
    │   ├── App.js        # Main React Router
    │   └── index.js      # React entry point
    └── package.json
```

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SyncRoom
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup Environment Variables**
   Create a `.env` file in the `backend/` directory.

## Environment Variables
The backend requires the following environment variables to run securely.
```env
# backend/.env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
```

## Running the Project

1. **Start the Backend server** (runs on port 8000 by default)
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend client** (runs on port 3000 by default)
   ```bash
   cd frontend
   npm start
   ```

## Future Improvements
* Screen Sharing toggle integration for collaborative presentations.
* Mute/unmute global synchronization for meeting hosts.
* STUN/TURN server deployment for reliable network traversal behind restrictive corporate firewalls.
# SyncRoom
