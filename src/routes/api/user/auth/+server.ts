import { client } from "$db/mongo"
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request, cookies }) => {
    const sessionToken = cookies.get('session_token');
    if (!sessionToken) {
        return new Response(JSON.stringify({ error: 'No se encontró el token de sesión' }), { status: 401 });
    }
    const db = client.db();
    const session = await db.collection('sessions').findOne({ token: sessionToken });
    if (!session) {
        return new Response(JSON.stringify({ error: 'No se encontró la sesión' }), { status: 401 });
    }
    const user = await db.collection('users').findOne({ _id: session.userId });
    if (!user) {
        return new Response(JSON.stringify({ error: 'No se encontró el usuario' }), { status: 401 });
    }
    return new Response(JSON.stringify({
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name
        }
    }), { status: 200 });

  
}