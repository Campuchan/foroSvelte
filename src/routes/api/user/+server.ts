import { client } from "$db/mongo"
import type { RequestHandler } from "@sveltejs/kit";

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