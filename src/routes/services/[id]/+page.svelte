<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<h1>{data.service.title}</h1>

<dl>
	<dt>Provider</dt>
	<dd><a href="/users/{data.service.providerId}">{data.service.providerName}</a></dd>

	<dt>Category</dt>
	<dd>{data.service.category}</dd>

	<dt>Price</dt>
	<dd>${data.service.price}</dd>

	<dt>Location</dt>
	<dd>{data.service.location ?? 'Not specified'}</dd>

	<dt>Description</dt>
	<dd>{data.service.description}</dd>

	<dt>Posted</dt>
	<dd>{new Date(data.service.createdAt).toLocaleDateString()}</dd>
</dl>

{#if data.isOwner}
	<a href="/services/{data.service.id}/edit">Edit Service</a>
{:else if form?.booked}
	<p>Booking submitted! Waiting for provider to confirm.</p>
{:else if data.hasActiveBooking}
	<p>You already have a booking for this service.</p>
{:else if data.isLoggedIn}
	{#if form?.error}
		<p style="color: red">{form.error}</p>
	{/if}
	<h2>Book this service</h2>
	<form method="POST" action="?/book" use:enhance>
		<div>
			<label for="scheduledAt">Preferred date</label>
			<input type="datetime-local" name="scheduledAt" id="scheduledAt" required />
		</div>
		<div>
			<label for="note">Note (optional)</label>
			<textarea name="note" id="note" rows="3"></textarea>
		</div>
		<button type="submit">Book</button>
	</form>
{:else}
	<p><a href="/login">Sign in</a> to book this service.</p>
{/if}
