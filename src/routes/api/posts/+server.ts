import { ObjectId } from 'mongodb';
import { client } from '$db/mongo';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Usuario no autenticado' }), { status: 401 });
    }
    const userId = locals.user.id;

    const data = await request.json();
    if (!data.title || !data.content) {
        return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
    }
    const post = {
        userId,
        title: data.title,
        content: data.content,
        createdAt: new Date()
    };

    const result = await client.db().collection('posts').insertOne(post);
    if (result.acknowledged) {
        console.log('Post creado', result.insertedId);
        return new Response(JSON.stringify({ message: 'Post creado correctamente' }), { status: 200 });
    } else {
        console.error('Error creando post', result);
        return new Response(JSON.stringify({ error: 'Error al crear post' }), { status: 500 });
    }
};

export const GET: RequestHandler = async ({ request }) => {
    // const limitHeader = request.headers.get('limit'); en vez de con headers lo hago con parametros de url
    // const skipHeader = request.headers.get('skip');
    // const numberOfPosts = limitHeader ? parseInt(limitHeader) : 10;
    // const numberOfPostsSkip = skipHeader ? parseInt(skipHeader) : 0;
    if (!request.url.split('?')[1]) {
        return new Response(JSON.stringify({ error: 'No se encontraron posts' }), { status: 404 });
    }
    const requestParams = request.url.split('?')[1]?.split('&')
    // si no hay estan los parametros introduce 10 y 0
    const skipParam = requestParams[0] ? requestParams[0]?.split('=')[1] : "10" // un poco guarro 
    const limitParam = requestParams[1] ? requestParams[1]?.split('=')[1] : "0" // corta limit=10 en "skip" y "10" y coge lo segundo

    const numberOfPosts = parseInt(limitParam); // de normal 10
    const numberOfPostsSkip = parseInt(skipParam); // y 0

    const posts = await client.db()
        .collection('posts').find()
        .sort({ createdAt: -1 })
        .skip(numberOfPostsSkip).limit(numberOfPosts+1).toArray();
    const hayMas = posts.length > numberOfPosts; // si hay mas posts de los que se pidieron es que hay mas

    console.log("posts", posts)

    if (hayMas) { // si hay más posts, eliminamos el último
                  // el ultimo solo esta para comprobar si hay mas
        posts.pop();
    }
   
    const data = {
        posts,
        hayMas
    };
    
    if (!posts) {
        return new Response(JSON.stringify({ error: 'No se encontraron posts' }), { status: 404 });
    }
    return new Response(JSON.stringify(data), { status: 200 });

}