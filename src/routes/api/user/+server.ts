import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { client } from '$db/mongo';
import { JWT_KEY } from '$env/static/private';
import { ObjectId } from 'mongodb';

export const GET: RequestHandler = async ({ request, cookies }) => {

  let token: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = cookies.get('session_token') || null;
  }
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token ausente' }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const { userId } = decoded as { userId: string };
    const user = await client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }
    const { username, name, email } = user;
    return new Response(JSON.stringify({ id: user._id.toString(), username, name, email }), { status: 200 });
  } catch (err) {
    console.error('Error verifying token', err);
    return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401 });
  }
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get('session_token') || null;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token ausente' }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const { userId } = decoded as { userId: string };
    const user = await client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }
    
    const data = await request.json();
    const updatedUser = await client.db().collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: data }
    );
    
    if (updatedUser.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: 'No se pudo actualizar el usuario' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Usuario actualizado correctamente' }), { status: 200 });
  } catch (err) {
    console.error('Error verifying token', err);
    return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401 });
  }
}