import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { bookings, reviews, services } from '$lib/server/schema';

export async function getReviewByBookingId(bookingId: string) {
	const [review] = await db
		.select({
			id: reviews.id,
			rating: reviews.rating,
			comment: reviews.comment,
			createdAt: reviews.createdAt
		})
		.from(reviews)
		.where(eq(reviews.bookingId, bookingId));
	return review ?? null;
}

export async function createReview(values: {
	bookingId: string;
	reviewerId: string;
	rating: number;
	comment: string | null;
}) {
	await db.insert(reviews).values(values);
}

export async function getServiceRating(serviceId: string) {
	const [row] = await db
		.select({
			avg: sql<number | null>`AVG(${reviews.rating})::float`,
			count: sql<number>`COUNT(*)::int`
		})
		.from(reviews)
		.innerJoin(bookings, eq(reviews.bookingId, bookings.id))
		.where(eq(bookings.serviceId, serviceId));
	return { avg: row?.avg ?? null, count: row?.count ?? 0 };
}

export async function getProviderRating(providerId: string) {
	const [row] = await db
		.select({
			avg: sql<number | null>`AVG(${reviews.rating})::float`,
			count: sql<number>`COUNT(*)::int`
		})
		.from(reviews)
		.innerJoin(bookings, eq(reviews.bookingId, bookings.id))
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.where(eq(services.providerId, providerId));
	return { avg: row?.avg ?? null, count: row?.count ?? 0 };
}
