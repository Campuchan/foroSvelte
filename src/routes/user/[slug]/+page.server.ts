import { error } from '@sveltejs/kit';
import { client } from '$db/mongo';

export const load = async ({ params }) => {
    const { slug } = params;
    const db = client.db();

    const user = await db.collection('users').findOne({ username: slug });

    if (!user) {
        throw error(404, 'Usuario no encontrado');
    }

    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            username: user.username
        }
    };
};