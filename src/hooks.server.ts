import { type Handle } from '@sveltejs/kit';
import { start_mongo, client } from '$db/mongo';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { PUBLIC_WS_PORT } from '$env/static/public';
const PORT = PUBLIC_WS_PORT; // 34321

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
        //console.log('Usuario conectado:', socket.id);

        //salas
        socket.on('join:room', (data) => {
            if (!data || typeof data.roomId !== 'string') {
                console.error('Invalid roomId:', data.roomId);
                return;
            }
            const roomId = data.roomId;
            socket.join(roomId);
            socket.emit('joined:room', roomId);
            socket.to(roomId).emit('user:joined', socket.id);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
        });

        socket.on('chat:message', ({roomId, message}) => {
            
            io.emit('chat:message', message);
        });

        socket.on('disconnect', () => {
            //console.log('Usuario desconectado:', socket.id);
        });
    });

    httpServer.listen(PORT, () => {
        console.log('Chat WebSocket server en puerto '+PORT+' :D');
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
                        name: user.name,
                        username: user.username
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