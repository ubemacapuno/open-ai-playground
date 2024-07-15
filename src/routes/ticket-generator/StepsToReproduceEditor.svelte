<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { Check, CircleX, Trash2, Plus, ChevronsDownUp } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { tick } from 'svelte'
	import { fly } from 'svelte/transition'

	export let steps: string[]
	export let onSave: (newSteps: string[]) => void
	export let onCancel: () => void

	let newSteps = writable([...steps])
	let newStepItem = writable('')
	let editingIndex = writable(-1)
	let editingValue = writable('')

	function addStepItem() {
		const item = $newStepItem.trim()
		if (!item) {
			toast.error('Error', { description: 'Item cannot be empty.' })
			return
		}
		newSteps.update((items) => {
			const updatedItems = [...items, item]
			onSave(updatedItems)
			return updatedItems
		})
		newStepItem.set('')
	}

	function removeStepItem(index: number) {
		newSteps.update((items) => {
			const updatedItems = items.filter((_, i) => i !== index)
			onSave(updatedItems)
			return updatedItems
		})
	}

	async function editStepItem(index: number) {
		editingIndex.set(index)
		editingValue.set($newSteps[index])
		await tick() // Wait for the DOM to update
		document.getElementById(`edit-step-${index}`)?.focus()
	}

	function saveEditedStepItem(index: number) {
		const value = $editingValue.trim()
		if (!value) {
			toast.error('Error', { description: 'Step cannot be empty.' })
			return
		}
		newSteps.update((items) => {
			items[index] = value
			onSave(items)
			return items
		})
		editingIndex.set(-1)
	}
</script>

<div class="mt-4 border-2 border-orange-700 rounded-md p-2" in:fly={{ duration: 150, y: '100%' }}>
	<div class="flex space-x-2 items-center mt-4">
		<Button type="button" on:click={onCancel} size="sm" class="text-sm p-1" variant="ghost">
			<ChevronsDownUp size={16} />
		</Button>
		<h3 class="font-medium text-orange-700 dark:text-orange-400">Steps to Reproduce:</h3>
	</div>

	<ul class="list-disc list-inside space-y-2">
		{#each $newSteps as step, index}
			<li class="flex items-center space-x-2">
				{#if $editingIndex === index}
					<Input
						id={`edit-criteria-${index}`}
						type="text"
						bind:value={$editingValue}
						on:keydown={(event) => event.key === 'Enter' && saveEditedStepItem(index)}
						class="w-full"
					/>
					<Button
						type="button"
						on:click={() => saveEditedStepItem(index)}
						size="sm"
						class="text-sm p-1"
						variant="ghost"
					>
						<Check size={16} color="#22c55e" />
					</Button>
					<Button
						type="button"
						on:click={() => editingIndex.set(-1)}
						size="sm"
						class="text-sm p-1"
						variant="ghost"
					>
						<CircleX size={16} color="#ef4444" />
					</Button>
				{:else}
					<span
						role="button"
						tabindex="0"
						on:click={() => editStepItem(index)}
						on:keydown={(event) => event.key === 'Enter' && editStepItem(index)}
					>
						{step}
					</span>
					<Button type="button" on:click={() => removeStepItem(index)} size="icon" variant="ghost">
						<Trash2 size={16} color="#ef4444" />
					</Button>
				{/if}
			</li>
		{/each}
	</ul>
	<div class="flex items-center space-x-2 mt-2">
		<Input
			type="text"
			bind:value={$newStepItem}
			class="w-full"
			placeholder="Add new item"
			on:keydown={(event) => event.key === 'Enter' && addStepItem()}
		/>
		<Button type="button" on:click={addStepItem} size="sm" class="text-sm p-1" variant="ghost">
			<Plus size={16} color="#22c55e" />
		</Button>
	</div>
</div>
