import type { PageServerLoad } from './$types';
import { listServices } from '$lib/server/repositories/services';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category');
	const results = await listServices({ category });
	return { services: results, category };
};
