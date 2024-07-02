<script lang="ts">
	import { page } from '$app/stores'
	import LightSwitch from './LightSwitch.svelte'
	import { ModeWatcher } from 'mode-watcher'
	import { applyAction, enhance } from '$app/forms'
	import { pb } from '$lib/pocketbase'

	export let currentUser

	let activeRoute = ''

	$: activeRoute = $page.url.pathname
</script>

<div
	class="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border bg-card bg-opacity-75 px-4 text-card-foreground backdrop-blur-lg backdrop-filter"
>
	<span class="hidden font-bold sm:inline-block">OpenAI Playground</span>
	<div class="inline-flex">
		{#if $currentUser}
			<span class="mr-4">Logged in as {$currentUser.username}</span>
			<form
				method="POST"
				action="/logout"
				use:enhance={() => {
					return async ({ result }) => {
						pb.authStore.clear()
						await applyAction(result)
					}
				}}
			>
				<button>Log out</button>
			</form>
		{/if}
		<LightSwitch />
		<ModeWatcher defaultMode={'dark'} />
	</div>
</div>
