import type { ObjectId } from "mongodb";

export type User = {
    userId: ObjectId;
    name: string;
    username: string;
    email: string;
};