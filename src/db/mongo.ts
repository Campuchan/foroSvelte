import { MongoClient } from 'mongodb';
import { MONGO_URL } from '$env/static/private'; // .env

const client = new MongoClient(MONGO_URL)

export function start_mongo() : Promise<MongoClient> {
    return client.connect()
}

export default client.db()