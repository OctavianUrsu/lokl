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

export const actions: Actions = {
	confirm: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const bookingId = formData.get('bookingId') as string;

		const [booking] = await db
			.select({ serviceId: bookings.serviceId })
			.from(bookings)
			.where(eq(bookings.id, bookingId));

		if (!booking) return fail(404, { error: 'Booking not found' });

		const [service] = await db
			.select({ providerId: services.providerId })
			.from(services)
			.where(eq(services.id, booking.serviceId));

		if (!service || service.providerId !== user.id) {
			return fail(403, { error: 'Not your booking' });
		}

		await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, bookingId));

		return { success: true };
	},

	cancel: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const bookingId = formData.get('bookingId') as string;

		const [booking] = await db
			.select({ serviceId: bookings.serviceId })
			.from(bookings)
			.where(eq(bookings.id, bookingId));

		if (!booking) return fail(404, { error: 'Booking not found' });

		const [service] = await db
			.select({ providerId: services.providerId })
			.from(services)
			.where(eq(services.id, booking.serviceId));

		if (!service || service.providerId !== user.id) {
			return fail(403, { error: 'Not your booking' });
		}

		await db.update(bookings).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(bookings.id, bookingId));

		return { success: true };
	}
};
