import type { LayoutServerLoad } from './$types';
import { getProfileRoleById } from '$lib/server/repositories/profiles';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!user) {
		return { session: null, user: null, profile: null };
	}

	const role = await getProfileRoleById(user.id);

	return { session, user, profile: role ? { role } : null };
};
