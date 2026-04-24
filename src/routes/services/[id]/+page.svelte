<script lang="ts">
	let { data } = $props();
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
{/if}
