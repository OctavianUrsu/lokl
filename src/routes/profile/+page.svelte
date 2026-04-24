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
