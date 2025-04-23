import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/session';

export async function POST({ cookies }) {
    const sessionToken = cookies.get('session_token');
    
    if (sessionToken) {
        await deleteSession(sessionToken);
        
        cookies.delete('session_token', { 
            path: '/' 
        });
    }

    return json({ success: true });
}