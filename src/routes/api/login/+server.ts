import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import client from '$db/mongo';

import { JWT_KEY } from '$env/static/private'; // .env

const JWT_SECRET = JWT_KEY; // Replace with a secure, environment-stored secret
const JWT_EXPIRATION = '1h'; // Token expiration time

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 });
        }

        const usersCollection = client.collection('users');

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid username or password' }), { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordMatch) {
            return new Response(JSON.stringify({ error: 'Invalid username or password' }), { status: 401 });
        }

        // Crea el token de acceso con el Id y el nombre de usuario, dura 1 hora
        const token = jwt.sign( 
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        return new Response(JSON.stringify({ message: 'Login successful', token }), { status: 200 });
    } catch (error) {
        console.error('Error logging in:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
};