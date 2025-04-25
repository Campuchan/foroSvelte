import type { ObjectId } from "mongodb";

export type Post = {
    postId: ObjectId;
    userId: ObjectId;
    title: string;
    content: string;
    timestamp: Date;
};