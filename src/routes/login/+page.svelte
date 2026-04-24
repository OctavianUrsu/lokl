<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<h1>Log In</h1>

{#if form?.error}
	<p style="color: red">{form.error}</p>
{/if}

<form method="POST" use:enhance>
	<div>
		<label for="email">Email</label>
		<input type="email" name="email" id="email" required />
	</div>
	<div>
		<label for="password">Password</label>
		<input type="password" name="password" id="password" required />
	</div>
	<button type="submit">Log In</button>
</form>
<p>Don't have an account? <a href="/signup">Sign up</a></p>
