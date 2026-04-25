import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { services } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { isUuid } from '$lib/utils/uuid';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		redirect(303, '/login');
	}

	if (!isUuid(params.id)) {
		error(404, 'Service not found');
	}

	const [service] = await db.select().from(services).where(eq(services.id, params.id));

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

		const [service] = await db.select().from(services).where(eq(services.id, params.id));

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

		await db
			.update(services)
			.set({
				title,
				description,
				category,
				price,
				location: location || null,
				updatedAt: new Date()
			})
			.where(eq(services.id, params.id));

		redirect(303, `/services/${params.id}`);
	}
};
