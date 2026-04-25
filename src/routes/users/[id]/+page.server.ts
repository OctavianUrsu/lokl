import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getPublicProfileById } from '$lib/server/repositories/profiles';

export const load: PageServerLoad = async ({ params }) => {
	if (!isUuid(params.id)) {
		error(404, 'User not found');
	}

	const profile = await getPublicProfileById(params.id);

	if (!profile) {
		error(404, 'User not found');
	}

	return { profile };
};
