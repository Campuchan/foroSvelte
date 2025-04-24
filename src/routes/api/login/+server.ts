import { json, error } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { createSession } from '$lib/session.js';
import bcrypt from 'bcryptjs';

export async function POST({ request, cookies }) {
    const { username , password } = await request.json();
    const db = client.db();
    
    if (!username || !password) {
        throw error(400, 'Faltan datos requeridos');
    }

    const user = await db.collection('users').findOne({ username });
    if (!user) {
        throw error(401, 'Usuario no existe o contraseña incorrecta');
    }

    if (!user.password || !(await bcrypt.compare(password, user.password))) {
        throw error(401, 'Usuario no existe o contraseña incorrecta');
    }

    const sessionToken = await createSession(user._id);
    
    cookies.set('session_token', sessionToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    });

    return json({
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name
        }
    });
}