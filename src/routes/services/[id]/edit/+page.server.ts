import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { getServiceById, updateService } from '$lib/server/repositories/services';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		redirect(303, '/login');
	}

	if (!isUuid(params.id)) {
		error(404, 'Service not found');
	}

	const service = await getServiceById(params.id);

	if (!service) {
		error(404, 'Service not found');
	}

	if (service.providerId !== user.id) {
		error(403, 'Not your service');
	}

	return { service };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			redirect(303, '/login');
		}

		const service = await getServiceById(params.id);

		if (!service) {
			error(404, 'Service not found');
		}

		if (service.providerId !== user.id) {
			error(403, 'Not your service');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const category = formData.get('category') as string;
		const price = formData.get('price') as string;
		const location = formData.get('location') as string;

		if (!title || !description || !category || !price) {
			return fail(400, { error: 'All fields are required' });
		}

		if (isNaN(Number(price)) || Number(price) <= 0) {
			return fail(400, { error: 'Price must be a positive number' });
		}

		await updateService(params.id, {
			title,
			description,
			category,
			price,
			location: location || null
		});

		redirect(303, `/services/${params.id}`);
	}
};
