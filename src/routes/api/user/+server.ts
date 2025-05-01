import { client } from "$db/mongo"
import type { RequestHandler } from "@sveltejs/kit";
import { promises as fs } from 'fs';
import path from 'path';
const db = client.db();

export const GET: RequestHandler = async ({ request }) => {

  const users = await client.db()
    .collection('users')
    .find()
    .sort({ username: 1 })
    .toArray();

  if (!users) {
    return new Response(JSON.stringify({ error: 'No se encontraron usuarios' }), { status: 404 });
  }
  return new Response(JSON.stringify(users), { status: 200 });  
}

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {

  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No estás autenticado' }), { status: 401 });
  }
  
  const data = await request.formData();
  if (locals.user.username != data.get('username')){
    return new Response(JSON.stringify({ error: 'No puedes editar este usuario' }), { status: 401 });
  }
  const oldname = data.get('oldname')?.toString() || '';
  const oldemail = data.get('oldemail')?.toString() || '';
  const name = data.get('name')?.toString()|| '';
  const imagen = data.get('imagenPerfil') as File;
  const email = data.get('email')?.toString() || '';

  // check email si hay cambio de email
  if(email != oldemail) {
    if (await db.collection('users').findOne({ email })) {
      console.log("Email ya en uso: " + email + " " + oldemail);
      return new Response(JSON.stringify({ error: 'Email ya en uso' }), { status: 409 });
    }
  }

  const user = await client.db()
    .collection('users')
    .findOne({ username: locals.user.username });
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'No se encontro el usuario' }), { status: 404 });
  }

  console.log("Imagen: " + imagen);
  if (imagen instanceof File) {
          const imgForm = new FormData();
          imgForm.append("nombreArchivo", locals.user.username); // se guarda con el nombre de usuario
          imgForm.append("image", imagen);
          imgForm.append("tipo", "perfil");
          const imageResponse = await fetch('/api/images', {
            method: 'POST',
            body: imgForm,
          });
      
          if (!imageResponse.ok) {
            throw new Response(JSON.stringify({ error: 'Error al subir imagen2' }), { status: 500 });
          }
      
          const imageData = await imageResponse.json();
          if (imageData.error) {
              throw new Response(JSON.stringify({ error: imageData.error }), { status: 500 });
          }
  }
  console.log("Set: " + name + " " + email);
  const userResult = await client.db()
    .collection('users')
    .updateOne({ username: locals.user.username }, { $set: { name: name, email: email } });
  
  if (!userResult) {
    return new Response(JSON.stringify({ error: 'No se pudo actualizar el usuario' }), { status: 500 });
  }
  return new Response(JSON.stringify({ message: 'Usuario actualizado' }), { status: 200 });
}

