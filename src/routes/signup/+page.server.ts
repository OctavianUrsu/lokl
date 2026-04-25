import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createProfile } from '$lib/server/repositories/profiles';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;
		const fullName = formData.get('fullName') as string;
		const role = formData.get('role') as 'customer' | 'provider';

		if (!email || !password || !fullName) {
			return fail(400, { error: 'All fields are required.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		if (data.user) {
			await createProfile({ id: data.user.id, email, fullName, role });
		}

		return { success: true };
	}
};
