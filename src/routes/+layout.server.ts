import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/schema';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!user) {
		return { session: null, user: null, profile: null };
	}

	const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id));

	return { session, user, profile: profile ?? null };
};
