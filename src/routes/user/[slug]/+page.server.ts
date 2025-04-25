import { error } from '@sveltejs/kit';
import { client } from '$db/mongo';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ( {params} ) => {
    const { slug } = params;
    const db = client.db();

    const user = await db.collection('users').findOne({ username: slug });

    if (!user) {
        throw error(404, 'Usuario no encontrado');
    }
    const response = {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            username: user.username
        }
    };
    return response;
};