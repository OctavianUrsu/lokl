<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<h1>Edit Service</h1>

{#if form?.error}
	<p style="color: red">{form.error}</p>
{/if}

<form method="POST" use:enhance>
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
	<button type="submit">Edit Service</button>
	<a href="/services/{data.service.id}">Cancel</a>
</form>
