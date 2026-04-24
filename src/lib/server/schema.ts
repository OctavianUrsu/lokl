import { pgTable, uuid, text, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'provider', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'completed', 'cancelled']);

// Profiles — extends Supabase auth.users
export const profiles = pgTable('profiles', {
	id: uuid('id').primaryKey(), // matches auth.users.id
	email: text('email').notNull(),
	fullName: text('full_name').notNull(),
	role: userRoleEnum('role').notNull().default('customer'),
	avatarUrl: text('avatar_url'),
	phone: text('phone'),
	bio: text('bio'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Services offered by providers
export const services = pgTable('services', {
	id: uuid('id').primaryKey().defaultRandom(),
	providerId: uuid('provider_id')
		.notNull()
		.references(() => profiles.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	category: text('category').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	location: text('location'),
	imageUrl: text('image_url'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Bookings
export const bookings = pgTable('bookings', {
	id: uuid('id').primaryKey().defaultRandom(),
	serviceId: uuid('service_id')
		.notNull()
		.references(() => services.id),
	customerId: uuid('customer_id')
		.notNull()
		.references(() => profiles.id),
	status: bookingStatusEnum('status').notNull().default('pending'),
	scheduledAt: timestamp('scheduled_at').notNull(),
	note: text('note'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Reviews — tied to completed bookings
export const reviews = pgTable('reviews', {
	id: uuid('id').primaryKey().defaultRandom(),
	bookingId: uuid('booking_id')
		.notNull()
		.references(() => bookings.id),
	reviewerId: uuid('reviewer_id')
		.notNull()
		.references(() => profiles.id),
	rating: integer('rating').notNull(), // 1-5
	comment: text('comment'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
