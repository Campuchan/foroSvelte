import { error } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { ObjectId } from 'mongodb';
import type { Comentario } from '$lib/types/comentario.js';

function crearComentarioTree(comentarios : Comentario[]) {
    const comentarioMap = new Map();

    //primero se hace un map de los comentarios
    comentarios.forEach(comentario => {
        comentarioMap.set(comentario._id.toString(), { ...comentario, replies: [] });
    });

    const arbol = [] as Comentario[];

    comentarios.forEach(comentario => {
        if (comentario.parentId) {
            const parent = comentarioMap.get(comentario.parentId.toString());
            if (parent) {
                parent.replies.push(comentarioMap.get(comentario._id.toString()));
            }
        } else {
            arbol.push(comentarioMap.get(comentario._id.toString()));
        }
    });

    return arbol;
}

export const load = async ({ params }) => {
    const { username, title } = params;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ username: username });
    if (!user) {
        throw error(404, 'Autor del post no encontrado');
    }
    const post = await db.collection('posts').findOne({ 
        userId: user._id,
        title: title
    });
    if (!post) {
        throw error(404, 'Post no encontrado');
    }
    const comentarios = await db.collection('comentarios').find({ postId: post._id }).toArray();
    return {
        post: {
            id: post._id.toString(),
            userId: post.userId.toString(),
            username: username,
            title: post.title,
            content: post.content,
            timestamp: post.timestamp
        },
        comentarios : crearComentarioTree(comentarios.map((comentario) => {
                return {
                    _id: comentario._id,
                    id: comentario._id.toString(),
                    userId: comentario.userId.toString(),
                    postId: comentario.postId.toString(),
                    content: comentario.content,
                    timestamp: comentario.timestamp
                };
            }).sort((a, b) => {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            }))
    }
}