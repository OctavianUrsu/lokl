import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isUuid } from '$lib/utils/uuid';
import { SERVICE_STATUSES, getServiceById, updateService } from '$lib/server/repositories/services';
import {
	countImagesByService,
	createImages,
	deleteImage,
	getImageById,
	listImagesByService
} from '$lib/server/repositories/serviceImages';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import {
	SERVICE_IMAGES_BUCKET,
	SERVICE_IMAGE_MAX_COUNT,
	SERVICE_IMAGE_MAX_SIZE,
	SERVICE_IMAGE_MIME_TYPES,
	extensionForMimeType
} from '$lib/utils/storage';
import { randomUUID } from 'node:crypto';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		redirect(303, '/login');
	}

	if (!isUuid(params.id)) {
		error(404, 'Service not found');
	}

	const service = await getServiceById(params.id);

	if (!service) {
		error(404, 'Service not found');
	}

	if (service.providerId !== user.id) {
		error(403, 'Not your service');
	}

	const images = await listImagesByService(params.id);

	return { service, images };
};

async function requireOwner(params: { id: string }, locals: App.Locals) {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const service = await getServiceById(params.id);
	if (!service) error(404, 'Service not found');
	if (service.providerId !== user.id) error(403, 'Not your service');

	return { user, service };
}

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		await requireOwner(params, locals);

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const category = formData.get('category') as string;
		const price = formData.get('price') as string;
		const location = formData.get('location') as string;
		const status = formData.get('status') as string;

		if (!title || !description || !category || !price) {
			return fail(400, { error: 'All fields are required' });
		}

		if (isNaN(Number(price)) || Number(price) <= 0) {
			return fail(400, { error: 'Price must be a positive number' });
		}

		if (!SERVICE_STATUSES.includes(status as (typeof SERVICE_STATUSES)[number])) {
			return fail(400, { error: 'Invalid status' });
		}

		await updateService(params.id, {
			title,
			description,
			category,
			price,
			location: location || null,
			status: status as (typeof SERVICE_STATUSES)[number]
		});

		redirect(303, `/services/${params.id}`);
	},

	uploadImage: async ({ request, params, locals }) => {
		await requireOwner(params, locals);

		const formData = await request.formData();
		const files = formData.getAll('image').filter((f): f is File => f instanceof File && f.size > 0);

		if (files.length === 0) {
			return fail(400, { uploadError: 'Please choose at least one image to upload.' });
		}

		for (const file of files) {
			if (file.size > SERVICE_IMAGE_MAX_SIZE) {
				return fail(400, { uploadError: `"${file.name}" exceeds the 5 MB limit.` });
			}
			if (!SERVICE_IMAGE_MIME_TYPES.includes(file.type as (typeof SERVICE_IMAGE_MIME_TYPES)[number])) {
				return fail(400, { uploadError: `"${file.name}" must be JPEG, PNG, or WEBP.` });
			}
		}

		const count = await countImagesByService(params.id);
		const remaining = SERVICE_IMAGE_MAX_COUNT - count;
		if (files.length > remaining) {
			return fail(400, {
				uploadError:
					remaining === 0
						? `You already have ${SERVICE_IMAGE_MAX_COUNT} images.`
						: `Only ${remaining} slot${remaining === 1 ? '' : 's'} remain. You selected ${files.length}.`
			});
		}

		const uploadedPaths: string[] = [];
		for (const file of files) {
			const ext = extensionForMimeType(file.type);
			const storagePath = `${params.id}/${randomUUID()}.${ext}`;

			const { error: uploadErr } = await supabaseAdmin.storage
				.from(SERVICE_IMAGES_BUCKET)
				.upload(storagePath, file, { contentType: file.type, upsert: false });

			if (uploadErr) {
				if (uploadedPaths.length > 0) {
					await supabaseAdmin.storage.from(SERVICE_IMAGES_BUCKET).remove(uploadedPaths);
				}
				return fail(500, { uploadError: `Upload failed for "${file.name}": ${uploadErr.message}` });
			}

			uploadedPaths.push(storagePath);
		}

		await createImages(
			uploadedPaths.map((storagePath, i) => ({
				serviceId: params.id,
				storagePath,
				position: count + i
			}))
		);

		return { uploaded: files.length };
	},

	removeImage: async ({ request, params, locals }) => {
		await requireOwner(params, locals);

		const formData = await request.formData();
		const imageId = formData.get('imageId') as string;

		if (!imageId || !isUuid(imageId)) {
			return fail(400, { removeError: 'Invalid image' });
		}

		const image = await getImageById(imageId);
		if (!image || image.serviceId !== params.id) {
			return fail(404, { removeError: 'Image not found' });
		}

		const { data, error: storageErr } = await supabaseAdmin.storage
			.from(SERVICE_IMAGES_BUCKET)
			.remove([image.storagePath]);

		if (storageErr) {
			return fail(500, { removeError: `Storage delete failed: ${storageErr.message}` });
		}

		if (!data || data.length === 0) {
			return fail(500, { removeError: 'Storage object not found — DB row not deleted to keep state consistent.' });
		}

		await deleteImage(imageId);

		return { removed: true };
	}
};
