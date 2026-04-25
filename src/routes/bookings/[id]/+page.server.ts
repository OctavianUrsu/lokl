import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getBookingDetail, getBookingForAuth, updateBookingStatus } from '$lib/server/repositories/bookings';
import { createReview, getReviewByBookingId } from '$lib/server/repositories/reviews';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	if (!isUuid(params.id)) {
		error(404, 'Booking not found');
	}

	const booking = await getBookingDetail(params.id);

	if (!booking || (user.id !== booking.customerId && user.id !== booking.providerId)) {
		error(404, 'Booking not found');
	}

	if (booking.status === 'pending') {
		booking.customerPhone = null;
		booking.providerPhone = null;
	}

	const review = await getReviewByBookingId(booking.id);

	return {
		booking,
		review,
		viewerRole: user.id === booking.providerId ? 'provider' : 'customer'
	};
};

export const actions: Actions = {
	complete: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await getBookingForAuth(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.customerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (b.status !== 'confirmed') return fail(400, { error: 'Booking must be confirmed first' });

		await updateBookingStatus(params.id, 'completed');
		return { success: true };
	},

	confirm: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await getBookingForAuth(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.providerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (b.status !== 'pending') return fail(400, { error: 'Booking must be pending' });

		await updateBookingStatus(params.id, 'confirmed');
		return { success: true };
	},

	cancel: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await getBookingForAuth(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.providerId !== user.id) return fail(403, { error: 'Not your booking' });
		if (b.status !== 'pending') return fail(400, { error: 'Booking must be pending' });

		await updateBookingStatus(params.id, 'cancelled');
		return { success: true };
	},

	review: async ({ params, request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');
		if (!isUuid(params.id)) return fail(404, { error: 'Booking not found' });

		const b = await getBookingForAuth(params.id);
		if (!b) return fail(404, { error: 'Booking not found' });
		if (b.customerId !== user.id) return fail(403, { error: 'Only the customer can review' });
		if (b.status !== 'completed') return fail(400, { error: 'Booking must be completed first' });

		const formData = await request.formData();
		const rating = Number(formData.get('rating'));
		const comment = (formData.get('comment') as string | null)?.trim() || null;

		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, { error: 'Rating must be 1-5' });
		}

		const existing = await getReviewByBookingId(params.id);
		if (existing) return fail(400, { error: 'Booking already reviewed' });

		await createReview({
			bookingId: params.id,
			reviewerId: user.id,
			rating,
			comment
		});

		return { success: true };
	}
};
