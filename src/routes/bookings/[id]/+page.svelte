<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	const b = $derived(data.booking);
	const isProvider = $derived(data.viewerRole === 'provider');
	const isCustomer = $derived(data.viewerRole === 'customer');
	const showPhones = $derived(b.status !== 'pending');
</script>

<h1>{b.serviceTitle}</h1>

<dl>
	<dt>Service</dt>
	<dd><a href="/services/{b.serviceId}">{b.serviceTitle}</a></dd>

	<dt>Status</dt>
	<dd>{b.status}</dd>

	<dt>Scheduled At</dt>
	<dd>{new Date(b.scheduledAt).toLocaleString()}</dd>

	<dt>Customer</dt>
	<dd>
		<a href="/users/{b.customerId}">{b.customerName}</a>
		{#if showPhones}
			· {b.customerPhone ?? 'no phone'}
		{/if}
	</dd>

	<dt>Provider</dt>
	<dd>
		<a href="/users/{b.providerId}">{b.providerName}</a>
		{#if showPhones}
			· {b.providerPhone ?? 'no phone'}
		{/if}
	</dd>

	{#if b.note}
		<dt>Note</dt>
		<dd>{b.note}</dd>
	{/if}

	<dt>Booked At</dt>
	<dd>{new Date(b.createdAt).toLocaleString()}</dd>
</dl>

{#if isCustomer && b.status === 'confirmed'}
	<form method="POST" action="?/complete" use:enhance>
		<button type="submit">Mark Complete</button>
	</form>
{/if}

{#if isProvider && b.status === 'pending'}
	<form method="POST" action="?/confirm" use:enhance style="display:inline">
		<button type="submit">Accept</button>
	</form>
	<form method="POST" action="?/cancel" use:enhance style="display:inline">
		<button type="submit">Decline</button>
	</form>
{/if}
