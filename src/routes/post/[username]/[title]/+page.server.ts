import { error } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { ObjectId } from 'mongodb';
import type { Comentario } from '$lib/types/comentario.js';

let comentarioAutores = new Map<string, string>(); // mapa de ids de usuario de los comentarios con su nombre

interface ComentarioFrontend extends Comentario {
    respuestaForm: boolean;
    contenidoRespuesta: string; //deficion de comentario con username
    username: string; // nombre del autor del comentario sacado de la base de datos
    respuestas: ComentarioFrontend[];
}


function crearComentarioTree(comentarios: ComentarioFrontend[]): ComentarioFrontend[] {
    const comentarioMap = new Map<string, ComentarioFrontend>();
    comentarios.forEach(comentario => {
      comentarioMap.set(comentario._id, { ...comentario, respuestas: [] });
    });
  
    const arbol: ComentarioFrontend[] = [];
    comentarios.forEach(comentario => {
      if (comentario.parentId) {
        const parent = comentarioMap.get(comentario.parentId);
        if (parent) {
          parent.respuestas.push(comentarioMap.get(comentario._id)!);
        }
      } else {
        arbol.push(comentarioMap.get(comentario._id)!);
      }
    });
  
    console.log("Arbol de comentarios: " + JSON.stringify(arbol, null, 2));
    return arbol;
  }

function obtenerUsername(userId: string) : string {    
    return comentarioAutores.get(userId.toString()) ?? "Desconocido2" // por si acaso explota
}

export const load = async ({ params }) => {
    const { username, title } = params;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ username: username });
    if (!user) {
        throw error(404, 'Autor del post no encontrado');
    }
    
    

    const post = await db.collection('posts').findOne({userId: user._id, title: title});
    if (!post) {
        throw error(404, 'Post no encontrado');
    }
    const comentarios = await db.collection('comentarios')
        .find({ postId: post._id.toString() })
        .toArray();
    console.log("Comentarios: " + JSON.stringify(comentarios, null, 2));

    await Promise.all(comentarios.map(async comentario => {
        if (!comentarioAutores.has(comentario.userId.toString())) {
            try {
                const userData = await db.collection('users').findOne({ _id : comentario.userId });
                comentarioAutores.set(comentario.userId.toString(), userData ? userData.username : "Desconocido1");
                console.log("Guardando " + comentario.userId.toString() + " con nombre " +  (userData ? userData.username : "Desconocido3"))
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        }
    }));
    
    return {
        post: {
            _id: post._id.toString(),
            userId: post.userId.toString(),
            username: username,
            title: post.title,
            content: post.content,
            timestamp: post.timestamp
        },
        comentarios: crearComentarioTree(comentarios.map((comentario) => {
            return {
                _id: comentario._id.toString(),
                userId: comentario.userId.toString(),
                postId: comentario.postId.toString(),
                parentId: comentario.parentId ? comentario.parentId.toString() : undefined,
                content: comentario.content,
                timestamp: comentario.timestamp,
                username: obtenerUsername(comentario.userId.toString()),
                respuestaForm: false,
                contenidoRespuesta: "",
                respuestas: [] // se llena en la funcion crearComentarioTree
            }
        }).sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }))
    };
}