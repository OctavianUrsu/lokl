import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { profiles, services } from '$lib/server/schema';

type ServiceStatus = (typeof services.status.enumValues)[number];

export async function getServiceById(id: string) {
	const [service] = await db.select().from(services).where(eq(services.id, id));
	return service ?? null;
}

export async function getServiceWithProvider(id: string) {
	const [service] = await db
		.select({
			id: services.id,
			title: services.title,
			description: services.description,
			category: services.category,
			price: services.price,
			location: services.location,
			status: services.status,
			createdAt: services.createdAt,
			providerId: services.providerId,
			providerName: profiles.fullName
		})
		.from(services)
		.innerJoin(profiles, eq(services.providerId, profiles.id))
		.where(eq(services.id, id));
	return service ?? null;
}

export async function getServiceProviderAndStatus(id: string) {
	const [row] = await db
		.select({ providerId: services.providerId, status: services.status })
		.from(services)
		.where(eq(services.id, id));
	return row ?? null;
}

export async function listServices(filter: { category?: string | null } = {}) {
	const where = filter.category
		? and(eq(services.status, 'active'), eq(services.category, filter.category))
		: eq(services.status, 'active');
	return db
		.select({
			id: services.id,
			title: services.title,
			category: services.category,
			price: services.price,
			location: services.location,
			status: services.status,
			createdAt: services.createdAt,
			providerId: services.providerId,
			providerName: profiles.fullName
		})
		.from(services)
		.innerJoin(profiles, eq(services.providerId, profiles.id))
		.where(where);
}

export async function listServicesByProvider(providerId: string) {
	return db.select().from(services).where(eq(services.providerId, providerId));
}

type ServiceWriteValues = {
	title: string;
	description: string;
	category: string;
	price: string;
	location: string | null;
};

export async function createService(providerId: string, values: ServiceWriteValues) {
	const [created] = await db
		.insert(services)
		.values({ providerId, ...values })
		.returning({ id: services.id });
	return created;
}

export async function updateService(id: string, values: ServiceWriteValues & { status?: ServiceStatus }) {
	await db
		.update(services)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(services.id, id));
}

export const SERVICE_STATUSES = services.status.enumValues;
export type { ServiceStatus };
