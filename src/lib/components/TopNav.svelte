<script lang="ts">
	import LightSwitch from './LightSwitch.svelte'
	import { ModeWatcher } from 'mode-watcher'
	import { applyAction, enhance } from '$app/forms'
	import { pb } from '$lib/pocketbase'
	import { Button } from '$lib/components/ui/button/index.js'
	import { LogOut, LogIn } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'

	export let currentUser
</script>

<div
	class="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border bg-card bg-opacity-75 px-4 text-card-foreground backdrop-blur-lg backdrop-filter"
>
	<a href="/">
		<span class="hidden font-bold sm:inline-block">OpenAI Playground</span>
	</a>
	{#if $currentUser}
		<span class="mr-4">Hello, {$currentUser.email} 👋</span>
	{/if}
	<div class="flex gap-2">
		<LightSwitch />
		{#if $currentUser}
			<form
				method="POST"
				action="/logout"
				use:enhance={() => {
					return async ({ result }) => {
						try {
							await applyAction(result)
							pb.authStore.clear()
							toast.success('Sign Out Success', {
								description: 'You have been signed out.'
							})
							console.log('signed out')
						} catch (err) {
							console.error(err)
							pb.authStore.clear()
							toast.error('Sign Out Failed', {
								description: 'Failed to sign out.'
							})
						}
					}
				}}
			>
				<Button type="submit" size="icon" variant="outline">
					<LogOut />
				</Button>
			</form>
		{:else}
			<a href="/login">
				<Button size="icon" variant="outline">
					<LogIn />
				</Button>
			</a>
		{/if}
		<ModeWatcher defaultMode={'dark'} />
	</div>
</div>
