<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<h1>Create Service</h1>

{#if form?.error}
	<p style="color: red">{form.error}</p>
{/if}

<form method="POST" use:enhance>
	<div>
		<label for="title">Title</label>
		<input type="text" name="title" id="title" required />
	</div>
	<div>
		<label for="description">Description</label>
		<textarea name="description" id="description" rows="4" required></textarea>
	</div>
	<div>
		<label for="category">Category</label>
		<select name="category" id="category" required>
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
		<input type="number" name="price" id="price" min="0.01" step="0.01" required />
	</div>
	<div>
		<label for="location">Location (optional)</label>
		<input type="text" name="location" id="location" />
	</div>
	<button type="submit">Create Service</button>
	<a href="/services">Cancel</a>
</form>
