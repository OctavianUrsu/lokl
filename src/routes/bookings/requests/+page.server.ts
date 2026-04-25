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

	const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id));

	if (!profile || profile.role !== 'provider') {
		redirect(303, '/');
	}

	const requests = await db
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledAt: bookings.scheduledAt,
			note: bookings.note,
			createdAt: bookings.createdAt,
			serviceTitle: services.title,
			serviceId: services.id,
			customerName: profiles.fullName,
			customerId: profiles.id
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.innerJoin(profiles, eq(bookings.customerId, profiles.id))
		.where(eq(services.providerId, user.id));

	return { requests };
};
