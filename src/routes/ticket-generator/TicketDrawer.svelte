<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import * as Drawer from '$lib/components/ui/drawer/index.js'
	import { ChevronsUpDown, ExternalLink } from 'lucide-svelte'
	import AcceptanceCriteriaEditor from './AcceptanceCriteriaEditor.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from './ticket-generator-types'
	import { tick } from 'svelte'
	import Select from './Select.svelte'
	import { TICKET_STATUSES } from '$lib/constants'
	import EditableField from './EditableField.svelte'

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

	// TODO - Add more fields to edit, move to constants file
	const fields = {
		title: newTitle,
		description: newDescription,
		acceptance_criteria: newAcceptanceCriteria
	}

	$: newTitle.set(ticket.title)
	$: newDescription.set(ticket.description)
	$: newAcceptanceCriteria.set([...ticket.acceptance_criteria])

	async function startEditing(field: 'title' | 'description' | 'acceptance_criteria') {
		exitAllEditModes()
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
		exitAllEditModes()
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

	function exitAllEditModes() {
		isEditingTitle.set(false)
		isEditingDescription.set(false)
		isEditingAcceptanceCriteria.set(false)
	}

	function handleSelectClick() {
		exitAllEditModes()
	}

	function handleSaveEdit(field: 'title' | 'description', value: string) {
		saveField(field, value)
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
					<EditableField
						value={ticket.title}
						isEditing={$isEditingTitle}
						fieldType="input"
						id={`edit-title-${ticket.id}`}
						on:startEdit={() => startEditing('title')}
						on:cancelEdit={() => cancelEdit('title')}
						on:saveEdit={({ detail }) => handleSaveEdit('title', detail)}
					/>
				</Drawer.Title>
				<Drawer.Description>
					<EditableField
						value={ticket.description}
						isEditing={$isEditingDescription}
						fieldType="textarea"
						id={`edit-description-${ticket.id}`}
						on:startEdit={() => startEditing('description')}
						on:cancelEdit={() => cancelEdit('description')}
						on:saveEdit={({ detail }) => handleSaveEdit('description', detail)}
					/>
				</Drawer.Description>

				<h3 class="font-medium text-orange-700 dark:text-orange-400 mt-4">Status:</h3>
				<Select
					items={TICKET_STATUSES}
					value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
					on:change={handleStatusChange}
					on:selectClick={handleSelectClick}
				/>
			</Drawer.Header>

			<div class="mt-4 lg:flex lg:gap-4">
				<div class="lg:w-1/2">
					{#if $isEditingAcceptanceCriteria}
						<AcceptanceCriteriaEditor
							criteria={$newAcceptanceCriteria}
							onSave={saveAcceptanceCriteria}
							onCancel={cancelAcceptanceCriteriaEdit}
						/>
					{:else}
						<div>
							<div class="flex space-x-2 items-center">
								<Button
									type="button"
									class="text-sm p-1"
									variant="ghost"
									on:click={() => startEditing('acceptance_criteria')}
								>
									<ChevronsUpDown size={16} />
								</Button>
								<h3 class="font-medium text-orange-700 dark:text-orange-400">
									Acceptance Criteria:
								</h3>
							</div>
							<ul class="list-disc list-inside space-y-2">
								{#each ticket.acceptance_criteria as criterion}
									<li>{criterion}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<div class="lg:w-1/2 mt-4 lg:mt-0">
					{#if ticket.steps_to_reproduce}
						<h3 class="font-medium text-orange-700 dark:text-orange-400">Steps to Reproduce:</h3>
						<ul class="list-disc list-inside">
							{#each ticket.steps_to_reproduce as step}
								<li>{step}</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

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
