import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/schema';

type ProfileRole = (typeof profiles.role.enumValues)[number];

export async function getProfileById(id: string) {
	const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
	return profile ?? null;
}

export async function getProfileRoleById(id: string) {
	const [row] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, id));
	return row?.role ?? null;
}

export async function getPublicProfileById(id: string) {
	const [profile] = await db
		.select({
			id: profiles.id,
			fullName: profiles.fullName,
			role: profiles.role,
			bio: profiles.bio,
			createdAt: profiles.createdAt
		})
		.from(profiles)
		.where(eq(profiles.id, id));
	return profile ?? null;
}

export async function createProfile(values: { id: string; email: string; fullName: string; role: ProfileRole }) {
	await db.insert(profiles).values(values);
}

export async function updateProfile(
	id: string,
	values: { fullName: string; phone: string | null; bio: string | null }
) {
	await db
		.update(profiles)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(profiles.id, id));
}
