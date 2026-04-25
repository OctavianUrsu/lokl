import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { bookings, profiles, services } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { isUuid } from '$lib/utils/uuid';
import { alias } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	if (!isUuid(params.id)) {
		error(404, 'Booking not found');
	}

	const providerProfile = alias(profiles, 'provider_profile');

	const [booking] = await db
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledAt: bookings.scheduledAt,
			note: bookings.note,
			createdAt: bookings.createdAt,
			serviceTitle: services.title,
			serviceId: services.id,
			providerId: services.providerId,
			providerName: providerProfile.fullName,
			providerPhone: providerProfile.phone,
			customerName: profiles.fullName,
			customerPhone: profiles.phone,
			customerId: bookings.customerId
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.innerJoin(profiles, eq(bookings.customerId, profiles.id))
		.innerJoin(providerProfile, eq(services.providerId, providerProfile.id))
		.where(eq(bookings.id, params.id));

	if (!booking || (user.id !== booking.customerId && user.id !== booking.providerId)) {
		error(404, 'Booking not found');
	}

	if (booking.status === 'pending') {
		booking.customerPhone = null;
		booking.providerPhone = null;
	}

	return { booking, viewerRole: user.id === booking.providerId ? 'provider' : 'customer' };
};

async function loadBookingFor(bookingId: string) {
	const [b] = await db
		.select({
			status: bookings.status,
			customerId: bookings.customerId,
			providerId: services.providerId
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.where(eq(bookings.id, bookingId));
	return b;
}

export const actions: Actions = {
	complete: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await loadBookingFor(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.customerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (b.status !== 'confirmed') return fail(400, { error: 'Booking must be confirmed first' });

		await db.update(bookings).set({ status: 'completed', updatedAt: new Date() }).where(eq(bookings.id, params.id));
		return { success: true };
	},

	confirm: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await loadBookingFor(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.providerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (b.status !== 'pending') return fail(400, { error: 'Booking must be pending' });

		await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, params.id));
		return { success: true };
	},

	cancel: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await loadBookingFor(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.providerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (b.status !== 'pending') return fail(400, { error: 'Booking must be pending' });

		await db.update(bookings).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(bookings.id, params.id));
		return { success: true };
	}
};
