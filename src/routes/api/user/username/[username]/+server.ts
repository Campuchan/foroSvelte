import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { client } from '$db/mongo';

export const GET: RequestHandler = async ({ params }) => {
    const { username } = params;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ username: username });
    if (!user) {
        throw error(404, 'Usuario no encontrado');
    }
    
    return json({
        user: user.name,
        username: user.username,
        email: user.email
    });
};