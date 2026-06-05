import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED:", socket.id)

        socket.on("join-call", (path) => {
            // Keep track of room on the socket object for O(1) lookup
            socket.roomCode = path;
            socket.join(path);

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // Emit to everyone in the room that a user joined
            io.to(path).emit("user-joined", socket.id, connections[path]);

            // Replay chat messages to the joining user
            if (messages[path] !== undefined) {
                messages[path].forEach((msg) => {
                    socket.emit("chat-message", msg.data, msg.sender, msg['socket-id-sender']);
                });
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            if (!data || typeof data !== 'string' || data.trim() === '') {
                return;
            }
            data = data.trim();

            const path = socket.roomCode;
            if (path && connections[path] !== undefined) {
                if (messages[path] === undefined) {
                    messages[path] = []
                }

                messages[path].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message in", path, ":", sender, data)

                // Native broadcast to the room
                io.to(path).emit("chat-message", data, sender, socket.id);
            }
        });

        socket.on("disconnect", () => {
            const path = socket.roomCode;
            
            if (path && connections[path] !== undefined) {
                // Inform others in the room
                socket.to(path).emit('user-left', socket.id);

                const index = connections[path].indexOf(socket.id);
                if (index !== -1) {
                    connections[path].splice(index, 1);
                }

                if (connections[path].length === 0) {
                    delete connections[path];
                }
            }

            // Fix memory leak
            delete timeOnline[socket.id];
            console.log("DISCONNECTED:", socket.id);
        });
    });

    return io;
}

