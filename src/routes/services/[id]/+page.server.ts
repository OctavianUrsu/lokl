import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getServiceProviderAndStatus, getServiceWithProvider } from '$lib/server/repositories/services';
import { createBooking, customerHasBookingForService } from '$lib/server/repositories/bookings';
import { getServiceRating } from '$lib/server/repositories/reviews';
import { listImagesByService } from '$lib/server/repositories/serviceImages';

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

	const [hasActiveBooking, rating, images] = await Promise.all([
		user && !isOwner ? customerHasBookingForService(service.id, user.id) : Promise.resolve(false),
		getServiceRating(service.id),
		listImagesByService(service.id)
	]);

	return { service, isOwner, isLoggedIn, hasActiveBooking, rating, images };
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

		const service = await getServiceProviderAndStatus(params.id);

		if (!service) {
			error(404, 'Service not found');
		}

		if (service.providerId === user.id) {
			return fail(400, { error: "You can't book your own service." });
		}

		if (service.status !== 'active') {
			return fail(400, { error: 'This service is not currently accepting bookings.' });
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
