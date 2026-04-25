import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getPublicProfileById } from '$lib/server/repositories/profiles';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isUuid(params.id)) {
		error(404, 'User not found');
	}

	const { user } = await locals.safeGetSession();
	if (user && params.id === user.id) {
		redirect(303, '/profile');
	}

	const profile = await getPublicProfileById(params.id);

	if (!profile) {
		error(404, 'User not found');
	}

	return { profile };
};
