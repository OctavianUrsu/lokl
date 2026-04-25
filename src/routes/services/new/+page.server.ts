import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProfileRoleById } from '$lib/server/repositories/profiles';
import { createService } from '$lib/server/repositories/services';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const role = await getProfileRoleById(user.id);

	if (role !== 'provider') {
		redirect(303, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			redirect(303, '/login');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const category = formData.get('category') as string;
		const price = formData.get('price') as string;
		const location = formData.get('location') as string;

		if (!title || !description || !category || !price) {
			return fail(400, { error: 'Title, description, category, and price are required.' });
		}

		if (isNaN(Number(price)) || Number(price) <= 0) {
			return fail(400, { error: 'Price must be a positive number.' });
		}

		const created = await createService(user.id, {
			title,
			description,
			category,
			price,
			location: location || null
		});

		redirect(303, `/services/${created.id}`);
	}
};
