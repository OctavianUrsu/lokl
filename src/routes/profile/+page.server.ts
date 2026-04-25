import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProfileById } from '$lib/server/repositories/profiles';
import { listServicesByProvider } from '$lib/server/repositories/services';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const profile = await getProfileById(user.id);

	if (!profile) {
		redirect(303, '/signup');
	}

	const myServices = profile.role === 'provider' ? await listServicesByProvider(user.id) : [];

	return { profile, services: myServices };
};
