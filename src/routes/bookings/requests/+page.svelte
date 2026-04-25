<script lang="ts">
	let { data } = $props();
</script>

<h1>Booking Requests</h1>

{#if data.requests.length === 0}
	<p>No booking requests yet.</p>
{:else}
	<ul>
		{#each data.requests as req (req.id)}
			<li>
				<a href="/bookings/{req.id}">
					<strong>{req.serviceTitle}</strong>
				</a>
				<span> · {req.status}</span>
				<span> · {new Date(req.scheduledAt).toLocaleDateString()}</span>
				<span> · by <a href="/users/{req.customerId}">{req.customerName}</a></span>
				{#if req.note}
					<p>Note: {req.note}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
