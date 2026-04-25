<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { data, children } = $props();

	function isActive(href: string) {
		return page.url.pathname === href;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav style="display:flex; gap: 1rem; align-items: center;">
		<h1 style="display:inline">lokl</h1>
		<a href="/" class:active={isActive('/')}>Home</a>
		<a href="/services" class:active={isActive('/services')}>Services</a>
		{#if data.session}
			{#if data.profile?.role === 'provider'}
				<a href="/services/new" class:active={isActive('/services/new')}>Post Service</a>
				<a href="/bookings/requests" class:active={isActive('/bookings/requests')}>Requests</a>
			{/if}
			<a href="/bookings" class:active={isActive('/bookings')}>Bookings</a>
			<a href="/profile" class:active={isActive('/profile')}>Profile</a>
			<form method="POST" action="/logout" style="display:inline">
				<button type="submit">Sign Out</button>
			</form>
		{:else}
			<a href="/login" class:active={isActive('/login')}>Sign In</a>
			<a href="/signup" class:active={isActive('/signup')}>Sign Up</a>
		{/if}
	</nav>
</header>

{@render children()}

<style>
	:global(body) {
		background-color: black;
		color: palevioletred;
	}

	:global(a) {
		color: lightgreen;
	}

	:global(a:hover) {
		color: white;
	}

	:global(a:active) {
		color: palegreen;
	}

	nav a.active {
		color: palevioletred;
		font-weight: bold;
	}
</style>
