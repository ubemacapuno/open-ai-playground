<script lang="ts">
	import { writable } from 'svelte/store'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import { Button } from '$lib/components/ui/button'
	import * as Drawer from '$lib/components/ui/drawer/index.js'
	import { Check, ChevronsUpDown, CircleX, ExternalLink } from 'lucide-svelte'
	import AcceptanceCriteriaEditor from './AcceptanceCriteriaEditor.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from './ticket-generator-types'
	import { tick } from 'svelte'
	import Select from './Select.svelte'

	export let ticket: TicketData
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>
	export let handleDrawerClose: () => void

	let isEditingTitle = writable(false)
	let newTitle = writable(ticket.title)
	let isEditingDescription = writable(false)
	let newDescription = writable(ticket.description)
	let isEditingAcceptanceCriteria = writable(false)
	let newAcceptanceCriteria = writable([...ticket.acceptance_criteria])
	let editingCriteriaIndex = writable(-1)

	const fields = {
		title: newTitle,
		description: newDescription,
		acceptance_criteria: newAcceptanceCriteria
	}
	const statuses = [
		{ label: 'Open', value: 'open' },
		{ label: 'In Progress', value: 'in_progress' },
		{ label: 'In Review', value: 'in_review' },
		{ label: 'Rejected', value: 'rejected' },
		{ label: 'Closed', value: 'closed' },
		{ label: 'Draft', value: 'draft' }
	]

	$: newTitle.set(ticket.title)
	$: newDescription.set(ticket.description)
	$: newAcceptanceCriteria.set([...ticket.acceptance_criteria])

	async function startEditing(field: 'title' | 'description' | 'acceptance_criteria') {
		if (field === 'title') {
			isEditingTitle.set(true)
		} else if (field === 'description') {
			isEditingDescription.set(true)
		} else if (field === 'acceptance_criteria') {
			isEditingAcceptanceCriteria.set(true)
		}
		await tick() // Wait for the DOM to update
		document.getElementById(`edit-${field}-${ticket.id}`)?.focus()
	}

	async function handleStatusChange(event) {
		const newStatus = event.detail.value
		if (newStatus !== ticket.status) {
			try {
				await updateTicket(ticket.id, { status: newStatus })
				ticket.status = newStatus
			} catch (error) {
				console.error(`Error updating ticket status:`, error)
			}
		}
	}

	function cancelEdit(field: 'title' | 'description' | 'acceptance_criteria') {
		if (field === 'title') {
			resetFieldValue(field)
			isEditingTitle.set(false)
		} else if (field === 'description') {
			resetFieldValue(field)
			isEditingDescription.set(false)
		} else if (field === 'acceptance_criteria') {
			resetFieldValue(field)
			isEditingAcceptanceCriteria.set(false)
		}
	}

	function resetFieldValue(field: 'title' | 'description' | 'acceptance_criteria') {
		if (fields[field]) {
			fields[field].set(ticket[field])
		}
		editingCriteriaIndex.set(-1)
	}

	async function saveField(field: 'title' | 'description' | 'acceptance_criteria', value: any) {
		if (field === 'title' && !value.trim()) {
			console.error('Title cannot be empty')
			resetFieldValue(field)
			return
		}

		try {
			await updateTicket(ticket.id, { [field]: value })
			ticket[field] = value
			if (field === 'title') {
				isEditingTitle.set(false)
			} else if (field === 'description') {
				isEditingDescription.set(false)
			} else if (field === 'acceptance_criteria') {
				editingCriteriaIndex.set(-1)
			}
		} catch (error) {
			console.error(`Error updating ticket ${field}:`, error)
			resetFieldValue(field)
		}
	}

	function saveAcceptanceCriteria(newCriteria: string[]) {
		newAcceptanceCriteria.set(newCriteria)
		saveField('acceptance_criteria', newCriteria)
	}

	function cancelAcceptanceCriteriaEdit() {
		resetFieldValue('acceptance_criteria')
		isEditingAcceptanceCriteria.set(false)
	}
</script>

<Drawer.Root onOpenChange={handleDrawerClose}>
	<Drawer.Trigger asChild let:builder>
		<Button builders={[builder]} type="submit" size="icon" class="text-sm" variant="ghost">
			<ExternalLink size={16} />
		</Button>
	</Drawer.Trigger>
	<Drawer.Content>
		<div class="drawer-content-wrapper mx-auto w-full max-w-full px-8">
			<Drawer.Header>
				<Drawer.Title>
					{#if $isEditingTitle}
						<form
							on:submit|preventDefault={() => saveField('title', $newTitle)}
							class="flex flex-col space-y-2"
						>
							<div class="flex gap-2">
								<Input
									id={`edit-title-${ticket.id}`}
									type="text"
									bind:value={$newTitle}
									class="w-full text-lg font-semibold"
								/>
								<div class="flex space-x-2">
									<Button type="submit" size="sm" class="text-sm p-1" variant="ghost">
										<Check size={16} color="#22c55e" />
									</Button>
									<Button
										type="button"
										on:click={() => cancelEdit('title')}
										size="sm"
										class="text-sm p-1"
										variant="ghost"
									>
										<CircleX size={16} color="#ef4444" />
									</Button>
								</div>
							</div>
						</form>
					{:else}
						<span
							role="button"
							tabindex="0"
							on:click={() => startEditing('title')}
							on:keydown={(event) => event.key === 'Enter' && startEditing('title')}
						>
							{ticket.title}
						</span>
					{/if}
				</Drawer.Title>
				<Drawer.Description>
					{#if $isEditingDescription}
						<form
							on:submit|preventDefault={() => saveField('description', $newDescription)}
							class="flex flex-col space-y-2"
						>
							<div class="flex gap-2">
								<Textarea
									id={`edit-description-${ticket.id}`}
									bind:value={$newDescription}
									class="w-full text-sm font-semibold"
								/>
								<div class="flex space-x-2">
									<Button type="submit" size="sm" class="text-sm p-1" variant="ghost">
										<Check size={16} color="#22c55e" />
									</Button>
									<Button
										type="button"
										on:click={() => cancelEdit('description')}
										size="sm"
										class="text-sm p-1"
										variant="ghost"
									>
										<CircleX size={16} color="#ef4444" />
									</Button>
								</div>
							</div>
						</form>
					{:else}
						<span
							role="button"
							tabindex="0"
							on:click={() => startEditing('description')}
							on:keydown={(event) => event.key === 'Enter' && startEditing('description')}
						>
							{ticket.description}
						</span>
					{/if}
				</Drawer.Description>

				<h3 class="font-medium text-orange-700 dark:text-orange-400 mt-4">Status:</h3>
				<Select
					items={statuses}
					value={statuses.find((status) => status.value === ticket.status)}
					on:change={handleStatusChange}
				/>
			</Drawer.Header>

			{#if $isEditingAcceptanceCriteria}
				<AcceptanceCriteriaEditor
					criteria={$newAcceptanceCriteria}
					onSave={saveAcceptanceCriteria}
					onCancel={cancelAcceptanceCriteriaEdit}
				/>
			{:else}
				<div class="mt-4">
					<div class="flex space-x-2 items-center mt-4">
						<Button
							type="button"
							class="text-sm p-1"
							variant="ghost"
							on:click={() => startEditing('acceptance_criteria')}
						>
							<ChevronsUpDown size={16} />
						</Button>
						<h3 class="font-medium text-orange-700 dark:text-orange-400">Acceptance Criteria:</h3>
					</div>
					<ul class="list-disc list-inside space-y-2">
						{#each ticket.acceptance_criteria as criterion}
							<li>{criterion}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if ticket.steps_to_reproduce}
				<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Steps to Reproduce:</h3>
				<ul class="list-disc list-inside">
					{#each ticket.steps_to_reproduce as step}
						<li>{step}</li>
					{/each}
				</ul>
			{/if}

			{#if ticket.technical_notes}
				<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Technical Notes:</h3>
				<ul class="list-disc list-inside">
					{#each ticket.technical_notes as note}
						<li>{note}</li>
					{/each}
				</ul>
			{/if}

			{#if ticket.labels}
				<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Labels:</h3>
				<div class="flex flex-wrap">
					{#each ticket.labels as label}
						<div class="m-1">
							<Badge>{label}</Badge>
						</div>
					{/each}
				</div>
			{/if}
			<Drawer.Footer>
				<Drawer.Close asChild let:builder>
					<Button builders={[builder]} variant="outline">Close</Button>
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>

<style>
	.drawer-content-wrapper {
		max-height: 80vh;
		overflow-y: auto;
	}
</style>
