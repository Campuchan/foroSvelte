import { json, error, type RequestHandler } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { createSession } from '$lib/session.js';


import bcrypt from 'bcryptjs';
export const POST: RequestHandler = async ({ request, cookies, fetch}) => {
    //const { email, password, name, username } = await request.json();
    const formData = await request.formData();
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const name = formData.get('name')?.toString() || '';
    const username = formData.get('username')?.toString().toLowerCase() || '';
    if(!email || !password || !name || !username) {
        throw error(400, 'Faltan datos obligatorios');
    }
    let imagen = formData.get('imagenPerfil') as File;
    
    if(!(imagen instanceof File)) {
        console.log("Imagen no subida o no valida, usando imagen de gato por defecto");
        const imagenCataas = await fetch('https://cataas.com/cat?type=square&size=200&width=200&height=200');
        const blob = await imagenCataas.blob();
        imagen = new File([blob], 'imagen.jpg', { type: blob.type });
    }

    const db = client.db();
    
    // check email
    if (await db.collection('users').findOne({ email })) {
        throw error(409, 'Email ya en uso');
    }
    
    // check nombre
    if (await db.collection('users').findOne({ username })) {
        throw error(409, 'Nombre de usuario ya en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
        email,
        name,
        username,
        password: hashedPassword
    });
    
    if (imagen instanceof Blob) {
        const imgForm = new FormData();
        imgForm.append("nombreArchivo", username); // se guarda con el nombre de usuario
        imgForm.append("image", imagen);
        imgForm.append("tipo", "perfil");
        const imageResponse = await fetch('/api/images', {
          method: 'POST',
          body: imgForm,
          
        });
    
        if (!imageResponse.ok) {
          throw error(500, 'Error al subir imagen');
        }
    
        const imageData = await imageResponse.json();
        if (imageData.error) {
            throw error(500, imageData.error);
        }
      }
  


    const sessionToken = await createSession(result.insertedId);
    
    cookies.set('session_token', sessionToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    });

    return json({
        user: {
            id: result.insertedId.toString(),
            email,
            name,
            username
        }
    });
}