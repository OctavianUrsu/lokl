<script lang="ts">
	let { data } = $props();

	const categories = [
		'cleaning',
		'plumbing',
		'electrical',
		'gardening',
		'moving',
		'painting',
		'tutoring',
		'other'
	];
</script>

<h1>Browse Services</h1>

<nav style="display:flex; gap:1rem;">
	<a href="/services">All</a>
	{#each categories as cat (cat)}
		<a href="/services?category={cat}" class:active={data.category === cat}>{cat}</a>
	{/each}
</nav>

{#if data.services.length === 0}
	<p>No services found.</p>
{:else}
	<ul>
		{#each data.services as service (service.id)}
			<li>
				<a href="/services/{service.id}">
					<strong>{service.title}</strong>
				</a>
				<span> — ${service.price}</span>
				<span> · {service.category}</span>
				<span> · by <a href="/users/{service.providerId}">{service.providerName}</a></span>
				{#if service.location}
					<span> · {service.location}</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
