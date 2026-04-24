<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		<a href="/">Home</a>
		<a href="/services">Services</a>
		{#if data.session}
			{#if data.profile?.role === 'provider'}
				<a href="/services/new">Post Service</a>
				<a href="/bookings/requests">Requests</a>
			{/if}
			<a href="/bookings">Bookings</a>
			<a href="/profile">Profile</a>
			<form method="POST" action="/logout" style="display:inline">
				<button type="submit">Sign Out</button>
			</form>
		{:else}
			<a href="/login">Sign In</a>
			<a href="/signup">Sign Up</a>
		{/if}
	</nav>
</header>

{@render children()}
