import type { ObjectId } from "mongodb";

export type Comentario = {
    _id: ObjectId; 
    postId: ObjectId; // id del post
    parentId?: ObjectId; // id del comentario al que responde, si es al post esta vacio
    userId: ObjectId; 
    content: string;
    timestamp: Date;
};