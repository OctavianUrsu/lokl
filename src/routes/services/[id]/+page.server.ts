import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getServiceProviderId, getServiceWithProvider } from '$lib/server/repositories/services';
import { createBooking, customerHasBookingForService } from '$lib/server/repositories/bookings';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isUuid(params.id)) {
		error(404, 'Service not found');
	}

	const service = await getServiceWithProvider(params.id);

	if (!service) {
		error(404, 'Service not found');
	}

	const { user } = await locals.safeGetSession();
	const isOwner = user?.id === service.providerId;
	const isLoggedIn = !!user;

	const hasActiveBooking = user && !isOwner ? await customerHasBookingForService(service.id, user.id) : false;

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

		const providerId = await getServiceProviderId(params.id);

		if (!providerId) {
			error(404, 'Service not found');
		}

		if (providerId === user.id) {
			return fail(400, { error: "You can't book your own service." });
		}

		await createBooking({
			serviceId: params.id,
			customerId: user.id,
			scheduledAt: new Date(scheduledAt),
			note: note || null
		});

		return { booked: true };
	}
};
