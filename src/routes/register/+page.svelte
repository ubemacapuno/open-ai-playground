<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import { pb } from '$lib/pocketbase'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Button } from '$lib/components/ui/button'
	import * as Card from '$lib/components/ui/card'
</script>

<div class="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-4">
	<Card.Root class="w-full max-w-md p-4 sm:p-6 lg:p-8 mx-4">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl">Register</Card.Title>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<form
				method="POST"
				action="?/traditional"
				class="grid gap-4"
				use:enhance={() => {
					return async ({ result }) => {
						pb.authStore.loadFromCookie(document.cookie)
						await applyAction(result)
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
				<div class="grid gap-2 w-full">
					<Label for="passwordConfirm">Confirm Password</Label>
					<Input
						type="password"
						id="passwordConfirm"
						name="passwordConfirm"
						placeholder="Confirm Password"
						class="w-full"
					/>
				</div>
				<Card.Footer class="w-full px-0">
					<Button type="submit" class="w-full">Register</Button>
				</Card.Footer>
			</form>
			<form method="post" action="?/OAuth2">
				<div>
					<p>Or</p>
					<button class="btn-auth" type="submit">
						<img
							class="btn-auth-img"
							src="/google_signin_buttons/web/1x/btn_google_signin_dark_pressed_web.png"
							alt="google sign in"
						/>
					</button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
