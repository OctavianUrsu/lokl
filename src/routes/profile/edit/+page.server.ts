import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

	if (!profile) {
		redirect(303, '/signup');
	}

	return { profile };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			redirect(303, '/login');
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const phone = formData.get('phone') as string;
		const bio = formData.get('bio') as string;

		if (!fullName) {
			return fail(400, { error: 'Name is required.' });
		}

		await db
			.update(profiles)
			.set({
				fullName,
				phone: phone || null,
				bio: bio || null,
				updatedAt: new Date()
			})
			.where(eq(profiles.id, user.id));

		redirect(303, '/profile');
	}
};
