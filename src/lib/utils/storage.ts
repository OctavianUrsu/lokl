import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const SERVICE_IMAGES_BUCKET = 'service-images';
export const SERVICE_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
export const SERVICE_IMAGE_MAX_COUNT = 5;
export const SERVICE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const MIME_EXTENSION: Record<(typeof SERVICE_IMAGE_MIME_TYPES)[number], string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

export function serviceImageUrl(storagePath: string) {
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SERVICE_IMAGES_BUCKET}/${storagePath}`;
}

export function extensionForMimeType(mime: string): string | null {
	return MIME_EXTENSION[mime as (typeof SERVICE_IMAGE_MIME_TYPES)[number]] ?? null;
}
