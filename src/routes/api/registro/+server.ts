import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import client from '$db/mongo';

// // POST /api/registro
// // Body: { username, name, email, password }
// // Response: { message, userId }
// // Error: { error }

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, name, email, password } = await request.json();

        if (!username || !name || !email || !password) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const usersCollection = client.collection('users');

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return new Response(JSON.stringify({ error: 'Nombre de usuario o email en uso' }), { status: 409 });
        }

        const result = await usersCollection.insertOne({ username, name, email, hashedPassword });

        return new Response(JSON.stringify({ message: 'Usuario registrado', userId: result.insertedId }), { status: 201 });
    } catch (error) {
        console.error('Error registering user:', error);
        return new Response(JSON.stringify({ error: '500 - Error de servidor' }), { status: 500 });
    }
};