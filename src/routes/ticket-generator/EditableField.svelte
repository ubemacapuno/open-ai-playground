<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import { Button } from '$lib/components/ui/button'
	import { Check, CircleX } from 'lucide-svelte'

	export let value: string
	export let isEditing: boolean
	export let fieldType: 'input' | 'textarea' = 'input'
	export let id: string

	let newValue = value

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
			return
		}
		dispatch('saveEdit', newValue)
	}
</script>

{#if isEditing}
	<form on:submit|preventDefault={saveEdit} class="flex flex-col space-y-2">
		<div class="flex gap-2">
			{#if fieldType === 'input'}
				<Input {id} type="text" bind:value={newValue} class="w-full text-lg font-semibold" />
			{:else}
				<Textarea {id} bind:value={newValue} class="w-full text-sm font-semibold" />
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
		role="button"
		tabindex="0"
		on:click={startEditing}
		on:keydown={(event) => event.key === 'Enter' && startEditing()}
	>
		{value}
	</span>
{/if}
