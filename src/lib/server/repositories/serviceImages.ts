import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { serviceImages } from '$lib/server/schema';

export async function listImagesByService(serviceId: string) {
	return db
		.select({
			id: serviceImages.id,
			storagePath: serviceImages.storagePath,
			position: serviceImages.position
		})
		.from(serviceImages)
		.where(eq(serviceImages.serviceId, serviceId))
		.orderBy(asc(serviceImages.position), asc(serviceImages.createdAt));
}

export async function countImagesByService(serviceId: string) {
	const [row] = await db
		.select({ count: sql<number>`COUNT(*)::int` })
		.from(serviceImages)
		.where(eq(serviceImages.serviceId, serviceId));
	return row?.count ?? 0;
}

export async function getImageById(id: string) {
	const [row] = await db
		.select({
			id: serviceImages.id,
			serviceId: serviceImages.serviceId,
			storagePath: serviceImages.storagePath
		})
		.from(serviceImages)
		.where(eq(serviceImages.id, id));
	return row ?? null;
}

export async function createImage(values: { serviceId: string; storagePath: string; position: number }) {
	const [row] = await db.insert(serviceImages).values(values).returning({ id: serviceImages.id });
	return row;
}

export async function createImages(values: { serviceId: string; storagePath: string; position: number }[]) {
	if (values.length === 0) return;
	await db.insert(serviceImages).values(values);
}

export async function deleteImage(id: string) {
	await db.delete(serviceImages).where(eq(serviceImages.id, id));
}
