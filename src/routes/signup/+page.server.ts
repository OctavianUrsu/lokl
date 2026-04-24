import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/schema';

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

		const { data, error } = await locals.supabase.auth.signUp({ email, password });

		if (error) {
			return fail(400, { error: error.message });
		}

		if (data.user) {
			await db.insert(profiles).values({
				id: data.user.id,
				email,
				fullName,
				role
			});
		}

		return { success: true };
	}
};
