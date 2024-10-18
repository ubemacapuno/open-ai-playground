<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import * as Drawer from '$lib/components/ui/drawer/index.js'
	import { ChevronsUpDown, ExternalLink } from 'lucide-svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from './ticket-generator-types'
	import { tick } from 'svelte'
	import Select from './Select.svelte'
	import { TICKET_PRIORITIES, TICKET_STATUSES } from '$lib/constants'
	import EditableField from './EditableField.svelte'
	import EditableList from './EditableList.svelte'
	import { createEventDispatcher } from 'svelte'

	// TODO: Find a way to lose focus on inputs after making an edit,
	// otherwise the drawer locks on and any movement will move the drawer

	const dispatch = createEventDispatcher()

	export let ticket: TicketData
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>

	function handleDrawerClose() {
		dispatch('closeDrawer')
		exitAllEditModes()
	}

	let isEditingTitle = writable(false)
	let newTitle = writable(ticket.title)

	let isEditingDescription = writable(false)
	let newDescription = writable(ticket.description)

	let isEditingAssignee = writable(false)
	let newAssignee = writable(ticket.assignee)

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

	// Labels
	let isEditingLabels = writable(false)
	let newLabels = writable([...ticket.technical_notes])
	let editingLabelsIndex = writable(-1)

	// TODO - Add more fields to edit, move to constants file
	const fields = {
		title: newTitle,
		description: newDescription,
		assignee: newAssignee,
		acceptance_criteria: newAcceptanceCriteria,
		steps_to_reproduce: newStep,
		technical_notes: newTechnicalNotes,
		labels: newLabels
	}

	$: newTitle.set(ticket.title)
	$: newDescription.set(ticket.description)
	$: newAssignee.set(ticket.assignee)
	$: newAcceptanceCriteria.set([...ticket.acceptance_criteria])
	$: newStep.set([...ticket.steps_to_reproduce])
	$: newTechnicalNotes.set([...ticket.technical_notes])
	$: newLabels.set([...ticket.labels])

	async function startEditing(
		field:
			| 'title'
			| 'description'
			| 'assignee'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes'
			| 'labels'
	) {
		exitAllEditModes()
		if (field === 'title') {
			isEditingTitle.set(true)
		} else if (field === 'description') {
			isEditingDescription.set(true)
		} else if (field === 'assignee') {
			isEditingAssignee.set(true)
		} else if (field === 'acceptance_criteria') {
			isEditingAcceptanceCriteria.set(true)
		} else if (field === 'steps_to_reproduce') {
			isEditingStepsToReproduce.set(true)
		} else if (field === 'technical_notes') {
			isEditingTechnicalNotes.set(true)
		} else if (field === 'labels') {
			isEditingLabels.set(true)
		}
		await tick() // wait for the DOM to update ?
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

	async function handlePriorityChange(event) {
		exitAllEditModes()
		const newPriority = event.detail.value
		if (newPriority !== ticket.priority) {
			try {
				await updateTicket(ticket.id, { priority: newPriority })
				ticket.priority = newPriority
			} catch (error) {
				console.error(`Error updating ticket priority:`, error)
			}
		}
	}

	function cancelEdit(
		field:
			| 'title'
			| 'description'
			| 'assignee'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes'
			| 'labels'
	) {
		if (field === 'title') {
			resetFieldValue(field)
			isEditingTitle.set(false)
		} else if (field === 'description') {
			resetFieldValue(field)
			isEditingDescription.set(false)
		} else if (field === 'assignee') {
			resetFieldValue(field)
			isEditingAssignee.set(false)
		} else if (field === 'acceptance_criteria') {
			resetFieldValue(field)
			isEditingAcceptanceCriteria.set(false)
		} else if (field === 'steps_to_reproduce') {
			resetFieldValue(field)
			isEditingStepsToReproduce.set(false)
		} else if (field === 'technical_notes') {
			resetFieldValue(field)
			isEditingTechnicalNotes.set(false)
		} else if (field === 'labels') {
			resetFieldValue(field)
			isEditingLabels.set(false)
		}
	}

	function exitAllEditModes() {
		isEditingTitle.set(false)
		isEditingDescription.set(false)
		isEditingAcceptanceCriteria.set(false)
		isEditingStepsToReproduce.set(false)
		isEditingTechnicalNotes.set(false)
		isEditingLabels.set(false)
		isEditingAssignee.set(false)
	}

	function handleSelectClick() {
		exitAllEditModes()
	}

	function handleSaveEdit(field: 'title' | 'description' | 'assignee', value: string) {
		saveField(field, value)
	}

	function resetFieldValue(
		field:
			| 'title'
			| 'description'
			| 'assignee'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes'
			| 'labels'
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
			| 'assignee'
			| 'acceptance_criteria'
			| 'steps_to_reproduce'
			| 'technical_notes'
			| 'labels',
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
			} else if (field === 'assignee') {
				isEditingAssignee.set(false)
			} else if (field === 'acceptance_criteria') {
				editingCriteriaIndex.set(-1)
			} else if (field === 'steps_to_reproduce') {
				editingStepIndex.set(-1)
			} else if (field === 'technical_notes') {
				editingTechnicalNotesIndex.set(-1)
			} else if (field === 'labels') {
				editingLabelsIndex.set(-1)
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

	function saveLabels(newBadgeLabels: string[]) {
		newLabels.set(newBadgeLabels)
		saveField('labels', newBadgeLabels)
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

	function cancelLabels() {
		resetFieldValue('labels')
		isEditingLabels.set(false)
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
						isTicketDrawerDescription
						value={ticket.description}
						isEditing={$isEditingDescription}
						fieldType="textarea"
						id={`edit-description-${ticket.id}`}
						on:startEdit={() => startEditing('description')}
						on:cancelEdit={() => cancelEdit('description')}
						on:saveEdit={({ detail }) => handleSaveEdit('description', detail)}
					/>
				</Drawer.Description>
				<div class="flex space-x-4 mt-4">
					<div class="flex items-center space-x-2 mx-4">
						<h3 class="font-medium text-orange-700 dark:text-orange-400">Status:</h3>
						<Select
							items={TICKET_STATUSES}
							value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
							on:change={handleStatusChange}
							on:selectClick={handleSelectClick}
						/>
					</div>

					<div class="flex items-center space-x-2">
						<h3 class="font-medium text-orange-700 dark:text-orange-400">Priority:</h3>
						<Select
							items={TICKET_PRIORITIES}
							value={TICKET_PRIORITIES.find((priority) => priority.value === ticket.priority)}
							on:change={handlePriorityChange}
							on:selectClick={handleSelectClick}
						/>
					</div>

					<div class="flex items-center space-x-2">
						<h3 class="font-medium text-orange-700 dark:text-orange-400">Assignee:</h3>
						<EditableField
							value={ticket.assignee}
							isEditing={$isEditingAssignee}
							fieldType="input"
							id={`edit-assignee-${ticket.id}`}
							on:startEdit={() => startEditing('assignee')}
							on:cancelEdit={() => cancelEdit('assignee')}
							on:saveEdit={({ detail }) => handleSaveEdit('assignee', detail)}
						/>
					</div>
				</div>
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
				{#if $isEditingLabels}
					<EditableList
						items={$newLabels}
						onSave={saveLabels}
						onCancel={cancelLabels}
						title="Labels"
					/>
				{:else}
					<div>
						<div class="flex space-x-2 items-center">
							<Button
								type="button"
								class="text-sm p-1"
								variant="ghost"
								on:click={() => startEditing('labels')}
							>
								<ChevronsUpDown size={16} />
							</Button>
							<h3 class="font-medium text-orange-700 dark:text-orange-400">Labels</h3>
						</div>
						<ul class="list-disc list-inside space-y-2">
							{#each ticket.labels as label}
								<div class="m-1 inline-flex">
									<Badge>{label}</Badge>
								</div>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}
			<Drawer.Footer>
				<Drawer.Close asChild let:builder>
					<Button builders={[builder]} variant="outline">Close</Button>
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
