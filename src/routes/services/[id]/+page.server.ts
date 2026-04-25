import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { services, profiles, bookings } from '$lib/server/schema';
import { isUuid } from '$lib/utils/uuid';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isUuid(params.id)) {
		error(404, 'Service not found');
	}

	const [service] = await db
		.select({
			id: services.id,
			title: services.title,
			description: services.description,
			category: services.category,
			price: services.price,
			location: services.location,
			createdAt: services.createdAt,
			providerId: services.providerId,
			providerName: profiles.fullName
		})
		.from(services)
		.innerJoin(profiles, eq(services.providerId, profiles.id))
		.where(eq(services.id, params.id));

	if (!service) {
		error(404, 'Service not found');
	}

	const { user } = await locals.safeGetSession();
	const isOwner = user?.id === service.providerId;
	const isLoggedIn = !!user;

	// Check if customer already has a pending/confirmed booking
	let hasActiveBooking = false;
	if (user && !isOwner) {
		const [existing] = await db
			.select({ id: bookings.id })
			.from(bookings)
			.where(and(eq(bookings.serviceId, service.id), eq(bookings.customerId, user.id)));
		hasActiveBooking = !!existing;
	}

	return { service, isOwner, isLoggedIn, hasActiveBooking };
};

export const actions: Actions = {
	book: async ({ params, request, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			redirect(303, '/login');
		}

		const formData = await request.formData();
		const scheduledAt = formData.get('scheduledAt') as string;
		const note = formData.get('note') as string;

		if (!scheduledAt) {
			return fail(400, { error: 'Please select a date.' });
		}

		const [service] = await db
			.select({ providerId: services.providerId })
			.from(services)
			.where(eq(services.id, params.id));

		if (!service) {
			error(404, 'Service not found');
		}

		if (service.providerId === user.id) {
			return fail(400, { error: "You can't book your own service." });
		}

		await db.insert(bookings).values({
			serviceId: params.id,
			customerId: user.id,
			scheduledAt: new Date(scheduledAt),
			note: note || null
		});

		return { booked: true };
	}
};
