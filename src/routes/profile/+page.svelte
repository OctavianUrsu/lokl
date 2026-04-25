<script lang="ts">
	let { data } = $props();
</script>

<h1>Profile</h1>

<dl>
	<dt>Name</dt>
	<dd>{data.profile.fullName}</dd>

	<dt>Email</dt>
	<dd>{data.profile.email}</dd>

	<dt>Role</dt>
	<dd>{data.profile.role}</dd>

	<dt>Phone</dt>
	<dd>{data.profile.phone ?? 'Not set'}</dd>

	<dt>Bio</dt>
	<dd>{data.profile.bio ?? 'Not set'}</dd>

	<dt>Member since</dt>
	<dd>{new Date(data.profile.createdAt).toLocaleDateString()}</dd>
</dl>

<a href="/profile/edit">Edit Profile</a>

{#if data.services.length > 0}
	<h2>My Services</h2>
	<ul>
		{#each data.services as service (service.id)}
			<li>
				<a href="/services/{service.id}">
					<strong>{service.title}</strong>
				</a>
				<span> — ${service.price} · {service.category} · {service.status}</span>
				<a href="/services/{service.id}/edit">Edit</a>
			</li>
		{/each}
	</ul>
{/if}
