import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { profiles, services } from '$lib/server/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.id, user.id));

	if (!profile) {
		redirect(303, '/signup');
	}

	const myServices = profile.role === 'provider'
		? await db.select().from(services).where(eq(services.providerId, user.id))
		: [];

	return { profile, services: myServices };
};
