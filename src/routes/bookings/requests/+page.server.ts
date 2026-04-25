import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProfileRoleById } from '$lib/server/repositories/profiles';
import { listBookingRequestsForProvider } from '$lib/server/repositories/bookings';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const role = await getProfileRoleById(user.id);

	if (role !== 'provider') {
		redirect(303, '/');
	}

	const requests = await listBookingRequestsForProvider(user.id);

	return { requests };
};
