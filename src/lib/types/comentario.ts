import type { ObjectId } from "mongodb";

export type Comentario = {
    _id: string; 
    postId: string; // id del post
    parentId?: string; // id del comentario al que responde, si es al post esta vacio
    userId: string; 
    content: string;
    timestamp: Date;
};