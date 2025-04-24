import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { ObjectId } from 'mongodb';

export const GET: RequestHandler = async ({ params }) => {
    const { userId } = params;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw error(404, 'Usuario no encontrado');
    }
    
    return json({
        user: user.name,
        username: user.username,
        email: user.email
    });
};