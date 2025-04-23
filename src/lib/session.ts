// src/lib/server/session.ts
import { client } from '$db/mongo';
import { randomBytes } from 'crypto';
import type { ObjectId } from 'mongodb';

export async function createSession(userId: ObjectId): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await client.db().collection('sessions').insertOne({
        token,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 1 semana
    });
    return token;
}

export async function deleteSession(token: string): Promise<void> {
    await client.db().collection('sessions').deleteOne({ token });
}

