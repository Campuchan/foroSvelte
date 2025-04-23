import { redirect, type Handle } from '@sveltejs/kit';
import { MONGO_URL } from '$env/static/private';
import { start_mongo, client } from '$db/mongo';
import { ObjectId } from 'mongodb';
import { randomBytes } from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

start_mongo().then(() => {
    console.log("MongoDB conectado");
}) .catch((err) => {
    console.error("MongoDB error conexion:", err);
});

declare global {
    var socketServer: SocketIOServer;
}


if (!globalThis.socketServer) {
    const httpServer = createServer();
    const io = new SocketIOServer(httpServer, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket) => {
        console.log('Usuario conectado:', socket.id);

        //salas
        socket.on('join:room', (data) => {
            console.log('Raw data received:', JSON.stringify(data)); // Debug the exact payload
            if (!data || typeof data.roomId !== 'string') { // Ensure roomId is a string
                console.error('Invalid roomId:', data.roomId);
                return;
            }
            const roomId = data.roomId;
            socket.join(roomId);
            console.log(`Usuario ${socket.id} se unió a la sala ${roomId}`);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
        });

        socket.on('privateMessage', ({ roomId, message }) => {
            io.to(roomId).emit('privateMessage', { roomId, message });
        });

        socket.on('chat:message', (message) => {
            io.emit('chat:message', message);
        });

        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);
        });
    });

    httpServer.listen(3001, () => {
        console.log('Chat WebSocket server en puerto 3001 :D');
    });

    globalThis.socketServer = io;
}

export const handle: Handle = async ({ event, resolve }) => {
    const sessionToken = event.cookies.get('session_token');
    const db = client.db();

    if (sessionToken) {
        try {
            const session = await db.collection('sessions').findOne({
                token: sessionToken,
                expiresAt: { $gt: new Date() }
            });

            if (session) {
                const user = await db.collection('users').findOne({
                    _id: session.userId
                });

                if (user) {
                    event.locals.user = {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name
                    };
                }
            }
        } catch (err) {
            console.error('Session validation error:', err);
            event.cookies.delete('session_token', { path: '/' });
        }
    }

    return resolve(event);
};