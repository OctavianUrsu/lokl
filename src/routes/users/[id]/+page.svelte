<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.profile.fullName}</h1>

<dl>
	<dt>Role</dt>
	<dd>{data.profile.role}</dd>

	<dt>Bio</dt>
	<dd>{data.profile.bio ?? 'No bio yet'}</dd>

	<dt>Member since</dt>
	<dd>{new Date(data.profile.createdAt).toLocaleDateString()}</dd>
</dl>
