<script lang="ts">
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import * as Card from '$lib/components/ui/card'
	import { Button } from '$lib/components/ui/button/index.js'
	import { enhance } from '$app/forms'

	let message: string | null = null

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search)
		message = urlParams.get('message')
	})
</script>

<div class="flex items-center flex-col justify-center min-h-[calc(100vh-4rem)] pt-4">
	{#if message}
		<h2 class="my-2 text-lg font-bold text-orange-700 dark:text-orange-400">{message}</h2>
	{/if}
	<Card.Root class="w-full max-w-md p-4 sm:p-6 lg:p-8 mx-4">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl text-center">Login with Google OAuth</Card.Title>
		</Card.Header>
		<Card.Content class="gap-4 flex flex-col items-center justify-center">
			<form
				method="post"
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
				<Button
					variant="outline"
					type="submit"
					class="flex items-center justify-center space-x-2 bg-white text-black hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
				>
					<img src="/google.svg" alt="Google Icon" class="h-5 w-5" />
					<span>Sign in with Google</span>
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
