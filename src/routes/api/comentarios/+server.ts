import type { Comentario } from '$lib/types/comentario'
import type { RequestHandler } from '@sveltejs/kit'
import { client } from '$db/mongo'

export const GET: RequestHandler = async ({ request }) => {

    const data = await request.json();
    const { postId } = data;
    const db = client.db()

    const comentarios = await db.collection('comentarios').find({ postId }).toArray()
    
    return new Response(JSON.stringify(comentarios), { status: 200 })

}