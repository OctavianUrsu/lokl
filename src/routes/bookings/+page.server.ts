import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bookings, services, profiles } from '$lib/server/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const myBookings = await db
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledAt: bookings.scheduledAt,
			note: bookings.note,
			createdAt: bookings.createdAt,
			serviceTitle: services.title,
			serviceId: services.id,
			providerId: profiles.id,
			providerName: profiles.fullName,
			providerPhone: profiles.phone
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.innerJoin(profiles, eq(services.providerId, profiles.id))
		.where(eq(bookings.customerId, user.id));

	return { bookings: myBookings };
};
