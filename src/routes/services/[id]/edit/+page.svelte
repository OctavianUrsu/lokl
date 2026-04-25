<script lang="ts">
	import { enhance } from '$app/forms';
	import { serviceImageUrl, SERVICE_IMAGE_MAX_COUNT } from '$lib/utils/storage';

	let { data, form } = $props();
	const remaining = $derived(SERVICE_IMAGE_MAX_COUNT - data.images.length);
</script>

<h1>Edit Service</h1>

{#if form?.error}
	<p style="color: tomato">{form.error}</p>
{/if}

<form method="POST" action="?/update" use:enhance>
	<div>
		<label for="title">Title</label>
		<input type="text" name="title" id="title" value={data.service.title} required />
	</div>
	<div>
		<label for="description">Description</label>
		<textarea name="description" id="description" rows="4" required>{data.service.description}</textarea>
	</div>
	<div>
		<label for="category">Category</label>
		<select name="category" id="category" value={data.service.category} required>
			<option value="">Select category</option>
			<option value="cleaning">Cleaning</option>
			<option value="plumbing">Plumbing</option>
			<option value="electrical">Electrical</option>
			<option value="gardening">Gardening</option>
			<option value="moving">Moving</option>
			<option value="painting">Painting</option>
			<option value="tutoring">Tutoring</option>
			<option value="other">Other</option>
		</select>
	</div>
	<div>
		<label for="price">Price ($)</label>
		<input type="number" name="price" id="price" min="0.01" step="0.01" value={data.service.price} required />
	</div>
	<div>
		<label for="location">Location (optional)</label>
		<input type="text" name="location" id="location" value={data.service.location ?? ''} />
	</div>
	<div>
		<label for="status">Status</label>
		<select name="status" id="status" value={data.service.status} required>
			<option value="active">Active — listed and bookable</option>
			<option value="paused">Paused — hidden, not bookable, existing bookings continue</option>
			<option value="archived">Archived — hidden permanently, history preserved</option>
		</select>
	</div>
	<button type="submit">Save Service</button>
	<a href="/services/{data.service.id}">Cancel</a>
</form>

<section>
	<h2>Images ({data.images.length}/{SERVICE_IMAGE_MAX_COUNT})</h2>

	{#if form?.removeError}
		<p style="color: tomato">{form.removeError}</p>
	{/if}

	{#if data.images.length > 0}
		<ul style="display:flex; flex-wrap:wrap; gap:1rem; list-style:none; padding:0;">
			{#each data.images as image (image.id)}
				<li style="display:flex; flex-direction:column; gap:0.25rem;">
					<img
						src={serviceImageUrl(image.storagePath)}
						alt=""
						style="width:160px; height:160px; object-fit:cover;"
						loading="lazy"
					/>
					<form method="POST" action="?/removeImage" use:enhance>
						<input type="hidden" name="imageId" value={image.id} />
						<button type="submit">Remove</button>
					</form>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No images yet.</p>
	{/if}

	{#if remaining > 0}
		{#if form?.uploadError}
			<p style="color: tomato">{form.uploadError}</p>
		{/if}
		<form method="POST" action="?/uploadImage" use:enhance enctype="multipart/form-data">
			<label for="image">Add up to {remaining} image{remaining === 1 ? '' : 's'} (JPEG/PNG/WEBP, max 5 MB each)</label>
			<input type="file" name="image" id="image" accept="image/jpeg,image/png,image/webp" multiple required />
			<button type="submit">Upload</button>
		</form>
	{:else}
		<p>Maximum number of images reached. Remove one to upload another.</p>
	{/if}
</section>
