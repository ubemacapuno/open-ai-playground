<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import LightSwitch from './LightSwitch.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { ModeWatcher } from 'mode-watcher'
	import { applyAction, enhance } from '$app/forms'
	import { pb } from '$lib/pocketbase'
	import { Sun, Moon, LogOut, User, Home, SunDim } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import UserAvatar from './UserAvatar.svelte'
	import { toggleMode } from 'mode-watcher'

	export let currentUser

	let isDarkMode = false

	function handleThemeToggle() {
		isDarkMode = !isDarkMode
		toggleMode()
	}
</script>

<div
	class="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border bg-card bg-opacity-75 px-4 text-card-foreground backdrop-blur-lg backdrop-filter"
>
	<div>
		<a href="/" class="hidden sm:inline-block" data-testid="homepage-btn">
			<span class="font-bold">OpenAI Playground</span>
		</a>
		<a href="/" class="sm:hidden">
			<Button variant="ghost" size="icon">
				<Home class="h-5 w-5" />
				<span class="sr-only">Home</span>
			</Button>
		</a>
	</div>

	<div class="flex items-center gap-2">
		{#if $currentUser}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button variant="ghost" size="icon" builders={[builder]}>
						<UserAvatar userImage={$currentUser.avatar} userEmail={$currentUser.email} />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Label class="text-sm text-muted-foreground"
						>{$currentUser.email}</DropdownMenu.Label
					>
					<DropdownMenu.Separator />
					<DropdownMenu.Item on:click={handleThemeToggle}>
						<span class="flex items-center">
							{#if isDarkMode}
								<Moon class="mr-2 h-4 w-4" />
								Theme
							{:else}
								<SunDim class="mr-2 h-4 w-4" />
								Theme
							{/if}
						</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
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
							<button type="submit" class="flex w-full items-center">
								<LogOut class="mr-2 h-4 w-4" />
								Sign Out
							</button>
						</form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<LightSwitch />
			<form
				method="POST"
				action="/login?/OAuth2"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' && result.data?.redirect) {
							window.location.href = result.data.redirect
						} else if (result.type === 'failure') {
							toast.error('Login Failed', {
								description: result.data?.message || 'An error occurred while trying to log in.'
							})
						}
					}
				}}
			>
				<Button type="submit" variant="outline">
					<User class="mr-2 h-4 w-4" />
					Sign In
				</Button>
			</form>
		{/if}
	</div>
	<ModeWatcher defaultMode={'dark'} />
</div>
