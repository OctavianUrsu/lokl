import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getPublicProfileById } from '$lib/server/repositories/profiles';
import { getProviderRating } from '$lib/server/repositories/reviews';

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

	const rating = profile.role === 'provider' ? await getProviderRating(profile.id) : null;

	return { profile, rating };
};
