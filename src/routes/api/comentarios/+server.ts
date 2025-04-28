import type { Comentario } from '$lib/types/comentario'
import type { RequestHandler } from '@sveltejs/kit'
import { client } from '$db/mongo'
import { ObjectId } from 'mongodb';

export const GET: RequestHandler = async ({ request }) => {

    const data = await request.json();
    const { postId } = data;
    const db = client.db()

    const comentarios = await db.collection('comentarios').find({ postId }).toArray()
    
    return new Response(JSON.stringify(comentarios), { status: 200 })

}

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Usuario no autenticado' }), { status: 401 });
    }

    const data = await request.json()
    const { postId, parentId, content } = data

    const userId = new ObjectId(locals.user.id);


    const db = client.db()

    const comentario = {
        _id: new ObjectId(),
        postId,
        parentId: parentId ? parentId : undefined, // si no es comentario de comentario es 
        userId,
        content,
        timestamp: new Date()
    }

    await db.collection('comentarios').insertOne(comentario)

    return new Response(JSON.stringify(comentario), { status: 200 })
}