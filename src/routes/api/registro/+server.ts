import { json, error, type RequestHandler } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { createSession } from '$lib/session.js';

import bcrypt from 'bcryptjs';
export const POST: RequestHandler = async ({ request, cookies }) => {
    const { email, password, name, username } = await request.json();
    const db = client.db();
    
    // check email
    if (await db.collection('users').findOne({ email })) {
        throw error(409, 'Email ya en uso');
    }
    
    // check nombre
    if (await db.collection('users').findOne({ username })) {
        throw error(409, 'Nombre de usuario ya en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
        email,
        name,
        username,
        password: hashedPassword
    });

    const sessionToken = await createSession(result.insertedId);
    
    cookies.set('session_token', sessionToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    });

    return json({
        user: {
            id: result.insertedId.toString(),
            email,
            name,
            username
        }
    });
}