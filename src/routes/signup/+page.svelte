<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<h1>Sign Up</h1>

{#if form?.error}
	<p style="color: red">{form.error}</p>
{/if}

{#if form?.success}
	<p>Check your email to confirm your account.</p>
{:else}
	<form method="POST" use:enhance>
		<div>
			<label for="email">Email</label>
			<input type="email" name="email" id="email" required />
		</div>
		<div>
			<label for="password">Password</label>
			<input type="password" name="password" id="password" required minlength="6" />
		</div>
		<div>
			<label for="confirmPassword">Confirm Password</label>
			<input type="password" name="confirmPassword" id="confirmPassword" required minlength="6" />
		</div>
		<div>
			<label for="fullName">Full Name</label>
			<input type="text" name="fullName" id="fullName" required />
		</div>
		<div>
			<label for="role">Role</label>
			<select name="role" id="role">
				<option value="customer">Customer</option>
				<option value="provider">Service Provider</option>
			</select>
		</div>
		<button type="submit">Sign Up</button>
	</form>
	<p>Already have an account? <a href="/login">Log in</a></p>
{/if}
