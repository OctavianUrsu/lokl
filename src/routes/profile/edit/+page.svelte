<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<h1>Edit Profile</h1>

{#if form?.error}
	<p style="color: red">{form.error}</p>
{/if}

<form method="POST" use:enhance>
	<div>
		<label for="fullName">Full Name</label>
		<input type="text" name="fullName" id="fullName" value={data.profile.fullName} required />
	</div>
	<div>
		<label for="phone">Phone</label>
		<input type="tel" name="phone" id="phone" value={data.profile.phone ?? ''} />
	</div>
	<div>
		<label for="bio">Bio</label>
		<textarea name="bio" id="bio" rows="4">{data.profile.bio ?? ''}</textarea>
	</div>
	<button type="submit">Save</button>
	<a href="/profile">Cancel</a>
</form>
