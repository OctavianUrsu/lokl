import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listBookingsByCustomer } from '$lib/server/repositories/bookings';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const myBookings = await listBookingsByCustomer(user.id);

	return { bookings: myBookings };
};
