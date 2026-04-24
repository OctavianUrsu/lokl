import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/schema';

export const load: PageServerLoad = async ({ params }) => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(params.id)) {
		error(404, 'User not found');
	}

	const [profile] = await db
		.select({
			id: profiles.id,
			fullName: profiles.fullName,
			role: profiles.role,
			bio: profiles.bio,
			createdAt: profiles.createdAt
		})
		.from(profiles)
		.where(eq(profiles.id, params.id));

	if (!profile) {
		error(404, 'User not found');
	}

	return { profile };
};
