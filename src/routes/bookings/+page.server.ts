import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
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

export const actions: Actions = {
	complete: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const bookingId = formData.get('bookingId') as string;

		const [booking] = await db
			.select({ customerId: bookings.customerId, status: bookings.status })
			.from(bookings)
			.where(eq(bookings.id, bookingId));

		if (!booking) return fail(404, { error: 'Booking not found' });
		if (booking.customerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (booking.status !== 'confirmed') return fail(400, { error: 'Booking must be confirmed first' });

		await db.update(bookings).set({ status: 'completed', updatedAt: new Date() }).where(eq(bookings.id, bookingId));

		return { success: true };
	}
};
