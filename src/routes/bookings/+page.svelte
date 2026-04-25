<script lang="ts">
	let { data } = $props();
</script>

<h1>My Bookings</h1>

{#if data.bookings.length === 0}
	<p>No bookings yet. <a href="/services">Browse services</a></p>
{:else}
	<ul>
		{#each data.bookings as booking (booking.id)}
			<li>
				<a href="/bookings/{booking.id}">
					<strong>{booking.serviceTitle}</strong>
				</a>
				<span> · {booking.status}</span>
				<span> · {new Date(booking.scheduledAt).toLocaleDateString()}</span>
				<span> · by <a href="/users/{booking.providerId}">{booking.providerName}</a></span>
			</li>
		{/each}
	</ul>
{/if}
