import dns from 'dns'

// Force Node to use Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4'])

import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectToSocket } from "./controllers/socketManager.js";

const PORT = process.env.PORT || 8000;

// Connect to database asynchronously without blocking server start
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
connectToSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
