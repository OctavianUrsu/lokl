import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProfileById, updateProfile } from '$lib/server/repositories/profiles';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const profile = await getProfileById(user.id);

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

		await updateProfile(user.id, { fullName, phone: phone || null, bio: bio || null });

		redirect(303, '/profile');
	}
};
