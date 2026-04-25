import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '$lib/server/db';
import { bookings, profiles, services } from '$lib/server/schema';

type BookingStatus = (typeof bookings.status.enumValues)[number];

export async function getBookingDetail(id: string) {
	const providerProfile = alias(profiles, 'provider_profile');
	const [booking] = await db
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledAt: bookings.scheduledAt,
			note: bookings.note,
			createdAt: bookings.createdAt,
			serviceTitle: services.title,
			serviceId: services.id,
			providerId: services.providerId,
			providerName: providerProfile.fullName,
			providerPhone: providerProfile.phone,
			customerName: profiles.fullName,
			customerPhone: profiles.phone,
			customerId: bookings.customerId
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.innerJoin(profiles, eq(bookings.customerId, profiles.id))
		.innerJoin(providerProfile, eq(services.providerId, providerProfile.id))
		.where(eq(bookings.id, id));
	return booking ?? null;
}

export async function getBookingForAuth(id: string) {
	const [row] = await db
		.select({
			status: bookings.status,
			customerId: bookings.customerId,
			providerId: services.providerId
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.where(eq(bookings.id, id));
	return row ?? null;
}

export async function customerHasBookingForService(serviceId: string, customerId: string) {
	const [row] = await db
		.select({ id: bookings.id })
		.from(bookings)
		.where(and(eq(bookings.serviceId, serviceId), eq(bookings.customerId, customerId)));
	return !!row;
}

export async function listBookingsByCustomer(customerId: string) {
	return db
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledAt: bookings.scheduledAt,
			note: bookings.note,
			createdAt: bookings.createdAt,
			serviceTitle: services.title,
			serviceId: services.id,
			providerId: profiles.id,
			providerName: profiles.fullName
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.innerJoin(profiles, eq(services.providerId, profiles.id))
		.where(eq(bookings.customerId, customerId));
}

export async function listBookingRequestsForProvider(providerId: string) {
	return db
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledAt: bookings.scheduledAt,
			note: bookings.note,
			createdAt: bookings.createdAt,
			serviceTitle: services.title,
			serviceId: services.id,
			customerName: profiles.fullName,
			customerId: profiles.id
		})
		.from(bookings)
		.innerJoin(services, eq(bookings.serviceId, services.id))
		.innerJoin(profiles, eq(bookings.customerId, profiles.id))
		.where(eq(services.providerId, providerId));
}

export async function createBooking(values: {
	serviceId: string;
	customerId: string;
	scheduledAt: Date;
	note: string | null;
}) {
	await db.insert(bookings).values(values);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
	await db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, id));
}
