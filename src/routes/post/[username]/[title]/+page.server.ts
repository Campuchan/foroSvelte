import { error } from '@sveltejs/kit';
import { client } from '$db/mongo';
import { ObjectId } from 'mongodb';

export const load = async ({ params }) => {
    const { username, title } = params;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ username: username });
    if (!user) {
        throw error(404, 'Autor del post no encontrado');
    }
    console.log(user);
    console.log(user._id)
    console.log(title)
    const post = await db.collection('posts').findOne({ 
        userId: user._id,
        title: title
    });
    if (!post) {
        throw error(404, 'Post no encontrado');
    }
    console.log(post);
    return {
        post: {
            id: post._id.toString(),
            userId: post.userId.toString(),
            username: username,
            title: post.title,
            content: post.content,
            timestamp: post.timestamp
        }
    }
}