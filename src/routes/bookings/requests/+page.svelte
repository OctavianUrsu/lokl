<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<h1>Booking Requests</h1>

{#if data.requests.length === 0}
	<p>No booking requests yet.</p>
{:else}
	<ul>
		{#each data.requests as req (req.id)}
			<li>
				<a href="/services/{req.serviceId}">
					<strong>{req.serviceTitle}</strong>
				</a>
				<span> · {req.status}</span>
				<span> · {new Date(req.scheduledAt).toLocaleDateString()}</span>
				<span> · by <a href="/users/{req.customerId}">{req.customerName}</a></span>
				{#if req.note}
					<p>Note: {req.note}</p>
				{/if}
				{#if req.status === 'pending'}
					<form method="POST" action="?/confirm" use:enhance style="display:inline">
						<input type="hidden" name="bookingId" value={req.id} />
						<button type="submit">Accept</button>
					</form>
					<form method="POST" action="?/cancel" use:enhance style="display:inline">
						<input type="hidden" name="bookingId" value={req.id} />
						<button type="submit">Decline</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
