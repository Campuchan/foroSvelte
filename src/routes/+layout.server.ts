import { user } from '$lib/auth.js'

export const load = async ({ locals }) => {
    user.set(locals.user || null);
    return {
        user: locals.user || null
    };
};  