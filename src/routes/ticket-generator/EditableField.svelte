<script lang="ts">
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import { Button } from '$lib/components/ui/button'
	import { Check, CircleX } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'

	export let value: string
	export let isEditing: boolean
	export let fieldType: 'input' | 'textarea' = 'input'
	export let id: string
	export let isTicketDrawerDescription = false // boolean to use different styles for drawer description

	let newValue: string = value

	const dispatch = createEventDispatcher()

	function startEditing() {
		dispatch('startEdit')
	}

	function cancelEdit() {
		newValue = value
		dispatch('cancelEdit')
	}

	function saveEdit() {
		if (fieldType === 'input' && !newValue.trim()) {
			console.error('Value cannot be empty')
			newValue = value
			toast.error('Error', { description: 'Value cannot be empty' })
			return
		}
		dispatch('saveEdit', newValue)
	}

	onMount(() => {
		// Listen for the 'closeDrawer' event from parent
		window.addEventListener('closeDrawer', cancelEdit)
		return () => {
			window.removeEventListener('closeDrawer', cancelEdit)
		}
	})
</script>

{#if isEditing}
	<form on:submit|preventDefault={saveEdit} class="flex flex-col space-y-2">
		<div class="flex gap-2">
			{#if fieldType === 'input'}
				<Input
					{id}
					type="text"
					bind:value={newValue}
					class="w-full max-w-full text-lg font-semibold"
					{...$$restProps}
				/>
			{:else}
				<Textarea
					{id}
					bind:value={newValue}
					class="w-full max-w-full text-sm font-semibold"
					{...$$restProps}
				/>
			{/if}
			<div class="flex space-x-2">
				<Button type="submit" size="sm" class="text-sm p-1" variant="ghost">
					<Check size={16} color="#22c55e" />
				</Button>
				<Button type="button" on:click={cancelEdit} size="sm" class="text-sm p-1" variant="ghost">
					<CircleX size={16} color="#ef4444" />
				</Button>
			</div>
		</div>
	</form>
{:else}
	<span
		class={`font-semibold ${
			isTicketDrawerDescription
				? 'inline-block w-full max-w-[50%] whitespace-normal break-words cursor-pointer'
				: 'overflow-hidden truncate'
		}`}
		role="button"
		tabindex="0"
		on:click={startEditing}
		on:keydown={(event) => event.key === 'Enter' && startEditing()}
		{...$$restProps}
	>
		{value}
	</span>
{/if}
