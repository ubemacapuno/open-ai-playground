<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import * as Drawer from '$lib/components/ui/drawer/index.js'
	import { ChevronsUpDown, ExternalLink } from 'lucide-svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from './ticket-generator-types'
	import { tick } from 'svelte'
	import Select from './Select.svelte'
	import { TICKET_STATUSES } from '$lib/constants'
	import EditableField from './EditableField.svelte'
	import EditableList from './EditableList.svelte'

	/**
	 * TODO:
	 * Update for assignee (string for now, will be User type later if I ever get to it)
	 * Update for technical notes (Editable Field, but display using tags component)
	 */

	export let ticket: TicketData
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>
	export let handleDrawerClose: () => void

	let isEditingTitle = writable(false)
	let newTitle = writable(ticket.title)
	let isEditingDescription = writable(false)
	let newDescription = writable(ticket.description)

	// Acceptance Criteria
	let isEditingAcceptanceCriteria = writable(false)
	let newAcceptanceCriteria = writable([...ticket.acceptance_criteria])
	let editingCriteriaIndex = writable(-1)

	// Steps to Reproduce
	let isEditingStepsToReproduce = writable(false)
	let newStep = writable([...ticket.steps_to_reproduce])
	let editingStepIndex = writable(-1)

	// Technical Notes
	let isEditingTechnicalNotes = writable(false)
	let newTechnicalNotes = writable([...ticket.technical_notes])
	let editingTechnicalNotesIndex = writable(-1)

	// TODO - Add more fields to edit, move to constants file
	const fields = {
		title: newTitle,
		description: newDescription,
		acceptance_criteria: newAcceptanceCriteria,
		steps_to_reproduce: newStep,
		technical_notes: newTechnicalNotes
	}

	$: newTitle.set(ticket.title)
	$: newDescription.set(ticket.description)
	$: newAcceptanceCriteria.set([...ticket.acceptance_criteria])
	$: newStep.set([...ticket.steps_to_reproduce])
	$: newTechnicalNotes.set([...ticket.technical_notes])

	async function startEditing(
		field:
			| 'title'
			| 'description'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes'
	) {
		exitAllEditModes()
		if (field === 'title') {
			isEditingTitle.set(true)
		} else if (field === 'description') {
			isEditingDescription.set(true)
		} else if (field === 'acceptance_criteria') {
			isEditingAcceptanceCriteria.set(true)
		} else if (field === 'steps_to_reproduce') {
			isEditingStepsToReproduce.set(true)
		} else if (field === 'technical_notes') {
			isEditingTechnicalNotes.set(true)
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

	function cancelEdit(
		field: 'title' | 'description' | 'acceptance_criteria' | 'steps_to_reproduce'
	) {
		if (field === 'title') {
			resetFieldValue(field)
			isEditingTitle.set(false)
		} else if (field === 'description') {
			resetFieldValue(field)
			isEditingDescription.set(false)
		} else if (field === 'acceptance_criteria') {
			resetFieldValue(field)
			isEditingAcceptanceCriteria.set(false)
		} else if (field === 'steps_to_reproduce') {
			resetFieldValue(field)
			isEditingStepsToReproduce.set(false)
		} else if (field === 'technical_notes') {
			resetFieldValue(field)
			isEditingTechnicalNotes.set(false)
		}
	}

	function exitAllEditModes() {
		isEditingTitle.set(false)
		isEditingDescription.set(false)
		isEditingAcceptanceCriteria.set(false)
		isEditingStepsToReproduce.set(false)
		isEditingTechnicalNotes.set(false)
	}

	function handleSelectClick() {
		exitAllEditModes()
	}

	function handleSaveEdit(field: 'title' | 'description', value: string) {
		saveField(field, value)
	}

	function resetFieldValue(
		field:
			| 'title'
			| 'description'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes'
	) {
		if (fields[field]) {
			fields[field].set(ticket[field])
		}
		editingCriteriaIndex.set(-1)
	}

	async function saveField(
		field:
			| 'title'
			| 'description'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes',
		value: any
	) {
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
			} else if (field === 'steps_to_reproduce') {
				editingStepIndex.set(-1)
			} else if (field === 'technical_notes') {
				editingTechnicalNotesIndex.set(-1)
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

	function saveStepsToReproduce(newReproductionStep: string[]) {
		newStep.set(newReproductionStep)
		saveField('steps_to_reproduce', newReproductionStep)
	}

	function saveTechnicalNotes(newNotes: string[]) {
		newTechnicalNotes.set(newNotes)
		saveField('technical_notes', newNotes)
	}

	function cancelAcceptanceCriteriaEdit() {
		resetFieldValue('acceptance_criteria')
		isEditingAcceptanceCriteria.set(false)
	}

	function cancelStepsToReproduceEdit() {
		resetFieldValue('steps_to_reproduce')
		isEditingStepsToReproduce.set(false)
	}

	function cancelTechnicalNotesEdit() {
		resetFieldValue('technical_notes')
		isEditingTechnicalNotes.set(false)
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
						<EditableList
							items={$newAcceptanceCriteria}
							onSave={saveAcceptanceCriteria}
							onCancel={cancelAcceptanceCriteriaEdit}
							title="Acceptance Criteria"
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
					{#if $isEditingStepsToReproduce}
						<EditableList
							items={$newStep}
							onSave={saveStepsToReproduce}
							onCancel={cancelStepsToReproduceEdit}
							title="Steps to Reproduce"
						/>
					{:else}
						<div>
							<div class="flex space-x-2 items-center">
								<Button
									type="button"
									class="text-sm p-1"
									variant="ghost"
									on:click={() => startEditing('steps_to_reproduce')}
								>
									<ChevronsUpDown size={16} />
								</Button>
								<h3 class="font-medium text-orange-700 dark:text-orange-400">
									Steps to Reproduce:
								</h3>
							</div>
							<ul class="list-disc list-inside space-y-2">
								{#each ticket.steps_to_reproduce as steps}
									<li>{steps}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>

			{#if ticket.technical_notes}
				{#if $isEditingTechnicalNotes}
					<EditableList
						items={$newTechnicalNotes}
						onSave={saveTechnicalNotes}
						onCancel={cancelTechnicalNotesEdit}
						title="Technical Notes"
					/>
				{:else}
					<div>
						<div class="flex space-x-2 items-center">
							<Button
								type="button"
								class="text-sm p-1"
								variant="ghost"
								on:click={() => startEditing('technical_notes')}
							>
								<ChevronsUpDown size={16} />
							</Button>
							<h3 class="font-medium text-orange-700 dark:text-orange-400">Technical Notes:</h3>
						</div>
						<ul class="list-disc list-inside space-y-2">
							{#each ticket.technical_notes as note}
								<li>{note}</li>
							{/each}
						</ul>
					</div>
				{/if}
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
