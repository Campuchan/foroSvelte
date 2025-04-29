import { error } from '@sveltejs/kit';
import { client } from '$db/mongo';

export const load = async ({ params }) => {
    const { user2 } = params;
    if(!user2) {
        return {
            tipo: 'publico'
        }
    }
    const db = client.db();

    const user2name = await db.collection('users').findOne({ username: user2 });

    if (!user2name) {
        throw error(404, 'Usuario no encontrado');
    }

    return {
        tipo: 'privado',
        user2: {
            id: user2name._id.toString(),
            name: user2name.name,
            email: user2name.email,
            username: user2name.username
        }
    };
};