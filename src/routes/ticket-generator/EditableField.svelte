<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import { Check, CircleX } from 'lucide-svelte'

	export let label: string
	export let value: string
	export let type: 'input' | 'textarea' = 'input'
	export let onSave: (newValue: string) => void
	export let onCancel: () => void

	let newValue = writable(value)
	let isEditing = writable(false)

	function startEditing() {
		isEditing.set(true)
	}

	function cancelEdit() {
		newValue.set(value)
		isEditing.set(false)
	}

	function save() {
		onSave($newValue)
		isEditing.set(false)
	}
</script>

{#if $isEditing}
	<form on:submit|preventDefault={save} class="flex flex-col space-y-2">
		<div class="flex gap-2">
			{#if type === 'input'}
				<Input type="text" bind:value={$newValue} class="w-full text-lg font-semibold" />
			{:else}
				<Textarea bind:value={$newValue} class="w-full text-sm font-semibold" />
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
		{label}: {value}
	</span>
{/if}
