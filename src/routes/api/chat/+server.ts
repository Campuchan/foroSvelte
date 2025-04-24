import { ObjectId } from 'mongodb';
import { client } from '$db/mongo';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    const { mensaje, roomId } = await request.json();
    const { user } = locals;
    
    if (!user) {
        return new Response(JSON.stringify({ info: 'No hay usuario' }), { status: 469 });
    }

    const data = {
        mensaje,
        roomId,
        userId: (user.id),
        createdAt: new Date()
    };

    const result = await client.db().collection('posts').insertOne(data);

    if (!result) {
        return new Response(JSON.stringify({ info: 'Error al guardar el mensaje' }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ info: 'Mensaje guardado' }), { status: 200 });
};

export const GET: RequestHandler = async ({ request }) => {
    const requestData = await request.json();
    const { roomId } = requestData;
    const mensajes = client.db()
        .collection('posts').find()
        .filter(roomId)
        .sort({ createdAt: -1 })

    const data = {
        mensajes
    };
    
    if (!mensajes) {
        return new Response(JSON.stringify({ info: 'No hay mensajes en el historial' }), { status: 469 });
    }
    return new Response(JSON.stringify(data), { status: 200 });

}