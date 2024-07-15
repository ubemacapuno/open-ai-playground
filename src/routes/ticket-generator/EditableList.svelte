<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { Check, CircleX, Trash2, Plus, ChevronsDownUp } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { tick } from 'svelte'
	import { fly } from 'svelte/transition'

	export let items: string[]
	export let onSave: (newItems: string[]) => void
	export let onCancel: () => void
	export let title: string = 'Items'

	let newItems = writable([...items])
	let newItem = writable('')
	let editingIndex = writable(-1)
	let editingValue = writable('')

	function addItem() {
		const item = $newItem.trim()
		if (!item) {
			toast.error('Error', { description: 'Item cannot be empty.' })
			return
		}
		newItems.update((items) => {
			const updatedItems = [...items, item]
			onSave(updatedItems)
			return updatedItems
		})
		newItem.set('')
	}

	function removeItem(index: number) {
		newItems.update((items) => {
			const updatedItems = items.filter((_, i) => i !== index)
			onSave(updatedItems)
			return updatedItems
		})
	}

	async function editItem(index: number) {
		editingIndex.set(index)
		editingValue.set($newItems[index])
		await tick() // Wait for the DOM to update
		document.getElementById(`edit-item-${index}`)?.focus()
	}

	function saveEditedItem(index: number) {
		const value = $editingValue.trim()
		if (!value) {
			toast.error('Error', { description: 'Item cannot be empty.' })
			return
		}
		newItems.update((items) => {
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
		<h3 class="font-medium text-orange-700 dark:text-orange-400">{title}:</h3>
	</div>

	<ul class="list-disc list-inside space-y-2">
		{#each $newItems as item, index}
			<li class="flex items-center space-x-2">
				{#if $editingIndex === index}
					<Input
						id={`edit-item-${index}`}
						type="text"
						bind:value={$editingValue}
						on:keydown={(event) => event.key === 'Enter' && saveEditedItem(index)}
						class="w-full"
					/>
					<Button
						type="button"
						on:click={() => saveEditedItem(index)}
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
						on:click={() => editItem(index)}
						on:keydown={(event) => event.key === 'Enter' && editItem(index)}
					>
						{item}
					</span>
					<Button type="button" on:click={() => removeItem(index)} size="icon" variant="ghost">
						<Trash2 size={16} color="#ef4444" />
					</Button>
				{/if}
			</li>
		{/each}
	</ul>
	<div class="flex items-center space-x-2 mt-2">
		<Input
			type="text"
			bind:value={$newItem}
			class="w-full"
			placeholder="Add new item"
			on:keydown={(event) => event.key === 'Enter' && addItem()}
		/>
		<Button type="button" on:click={addItem} size="sm" class="text-sm p-1" variant="ghost">
			<Plus size={16} color="#22c55e" />
		</Button>
	</div>
</div>
