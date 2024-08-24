<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import { pb } from '$lib/pocketbase'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Button } from '$lib/components/ui/button'
	import * as Card from '$lib/components/ui/card'
	import { page } from '$app/stores'
	import CircleAlert from 'lucide-svelte/icons/circle-alert'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { toast } from 'svelte-sonner'

	let message: string

	$: message = $page.url.searchParams.get('message') ?? ''
</script>

{#if message}
	<Alert.Root variant="caution" class="mt-2">
		<CircleAlert class="h-4 w-4" />
		<Alert.Title>Caution</Alert.Title>
		<Alert.Description>{message}</Alert.Description>
	</Alert.Root>
{/if}

<div class="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-4">
	<Card.Root class="w-full max-w-md p-4 sm:p-6 lg:p-8 mx-4">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl">Log in</Card.Title>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<form
				method="POST"
				class="grid gap-4"
				use:enhance={() => {
					return async ({ result }) => {
						try {
							await applyAction(result)
							pb.authStore.loadFromCookie(document.cookie)
							// if successful, show toast:
							if (pb.authStore.isValid) {
								toast.success('Sign In Success', {
									description: 'You have been signed in.'
								})
							} else {
								toast.error('Sign In Failed', {
									description: 'Failed to sign in.'
								})
							}
						} catch (err) {
							console.error(err)
							pb.authStore.clear()
							toast.error('Sign In Failed', {
								description: 'Failed to sign in.'
							})
						}
					}
				}}
			>
				<div class="grid gap-2 w-full">
					<Label for="email">Email</Label>
					<Input type="email" id="email" name="email" placeholder="Email" class="w-full" />
				</div>
				<div class="grid gap-2 w-full">
					<Label for="password">Password</Label>
					<Input
						type="password"
						id="password"
						name="password"
						placeholder="Password"
						class="w-full"
					/>
				</div>
				<Card.Footer class="w-full px-0">
					<Button type="submit" class="w-full">Log in</Button>
				</Card.Footer>
			</form>
			<div class="flex items-center justify-center space-x-2">
				<hr class="w-1/2 border-t border-gray-500" />
				<p class="text-gray-500">or</p>
				<hr class="w-1/2 border-t border-gray-500" />
			</div>
			<Card.Footer class="w-full px-0">
				<Button href="/register" class="w-full" variant="outline">Register</Button>
			</Card.Footer></Card.Content
		>
	</Card.Root>
</div>
