import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { profiles, services } from '$lib/server/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id));

	if (!profile || profile.role !== 'provider') {
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

		const [service] = await db
			.insert(services)
			.values({
				providerId: user.id,
				title,
				description,
				category,
				price,
				location: location || null
			})
			.returning({ id: services.id });

		redirect(303, `/services/${service.id}`);
	}
};
