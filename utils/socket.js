const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
// Map to store connected users: userId -> socket.id
const connectedUsers = new Map();

module.exports = {
    init: (server) => {
        io = socketIo(server);

        // Middleware for authentication
        io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';
            jwt.verify(token, jwtSecret, (err, decoded) => {
                if (err) {
                    return next(new Error('Authentication error: Invalid token'));
                }
                socket.userId = decoded.id;
                next();
            });
        });

        io.on('connection', (socket) => {
            console.log(`User connected to socket: ${socket.userId}`);
            connectedUsers.set(socket.userId, socket.id);

            socket.on('disconnect', () => {
                console.log(`User disconnected from socket: ${socket.userId}`);
                connectedUsers.delete(socket.userId);
            });
        });

        return io;
    },
    
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },

    notifyUser: (userId, event, data) => {
        if (!io) return;
        const socketId = connectedUsers.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit(event, data);
        }
    }
};
