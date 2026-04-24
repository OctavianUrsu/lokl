import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { services, profiles } from '$lib/server/schema';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category');

	const query = db
		.select({
			id: services.id,
			title: services.title,
			category: services.category,
			price: services.price,
			location: services.location,
			createdAt: services.createdAt,
			providerId: services.providerId,
			providerName: profiles.fullName
		})
		.from(services)
		.innerJoin(profiles, eq(services.providerId, profiles.id));

	const results = category ? await query.where(eq(services.category, category)) : await query;

	return { services: results, category };
};
