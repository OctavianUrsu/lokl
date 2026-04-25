import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { reviews } from '$lib/server/schema';

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
