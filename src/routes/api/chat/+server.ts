import { client } from '$db/mongo';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    const { from, content, roomId } = await request.json();
    const { user } = locals;
        
    if (!user) {
        return new Response(JSON.stringify({ info: 'No hay usuario' }), { status: 469 });
    }
    
    const data = {
        from : from,
        content : content,
        roomId : roomId,
        userId: (user.id),
        timestamp: new Date()
    };

    const result = await client.db().collection('chat').insertOne(data);
    
    if (!result) {
        return new Response(JSON.stringify({ info: 'Error al guardar el mensaje' }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ info: 'Mensaje guardado' }), { status: 200 });
};

export const GET: RequestHandler = async ({ url }) => {
    const roomId = url.searchParams.get('roomId');
    const skip = parseInt(url.searchParams.get('skip') || "0");
    
    //console.log('Recibiendo mensajes de la sala:', roomId, 'con skip:', skip);

    if (!roomId) {
        return new Response(JSON.stringify({ info: 'falta id de sala' }), { status: 469 });
    }

    const mensajesPorPagina = 20;
    let hayMas = false;
    
    const mensajes = await client.db()
        .collection('chat').find()
        .skip(skip)
        .limit(mensajesPorPagina + 1)
        .filter({roomId})
        .sort({ timestamp: -1 })
        .toArray()
        .then((mensajes) => {
            //console.log('Mensajes:', mensajes);
            return mensajes.map((mensaje) => {
                return {
                    ...mensaje,
                    timestamp: mensaje.timestamp
                };
            }).sort((a, b) => {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()})})


    if (mensajes.length > mensajesPorPagina) {
        mensajes.shift() //es como posts pero se elimina el primero por que es el mas viejo
        hayMas = true;
    }

    const data = {
        hayMas,
        mensajes
    };
    
    if (!mensajes) {
        return new Response(JSON.stringify({ info: 'No hay mensajes en el historial' }), { status: 469 });
    }
    return new Response(JSON.stringify(data), { status: 200 });

}