<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<h1>My Bookings</h1>

{#if data.bookings.length === 0}
	<p>No bookings yet. <a href="/services">Browse services</a></p>
{:else}
	<ul>
		{#each data.bookings as booking (booking.id)}
			<li>
				<a href="/services/{booking.serviceId}">
					<strong>{booking.serviceTitle}</strong>
				</a>
				<span> · {booking.status}</span>
				<span> · {new Date(booking.scheduledAt).toLocaleDateString()}</span>
				<span> · by <a href="/users/{booking.providerId}">{booking.providerName}</a></span>
				{#if booking.status === 'confirmed' && booking.providerPhone}
					<span> · Phone: {booking.providerPhone}</span>
				{/if}
				{#if booking.status === 'confirmed'}
					<form method="POST" action="?/complete" use:enhance style="display:inline">
						<input type="hidden" name="bookingId" value={booking.id} />
						<button type="submit">Mark Complete</button>
					</form>
				{/if}
				{#if booking.note}
					<p>Note: {booking.note}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
