import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { services, profiles } from '$lib/server/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(params.id)) {
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

	return { service, isOwner };
};
