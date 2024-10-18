<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import * as Card from '$lib/components/ui/card'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from '../ticket-generator-types'
	import { tick } from 'svelte'
	import Select from '../Select.svelte'
	import { TICKET_PRIORITIES, TICKET_STATUSES } from '$lib/constants'
	import EditableField from '../EditableField.svelte'
	import EditableList from '../EditableList.svelte'
	import { pb } from '$lib/pocketbase'
	import { toast } from 'svelte-sonner'
	import type { PageData } from '../$types'

	export let data: PageData

	$: ({ user, ticket } = data)

	let isEditingTitle = writable(false)
	let isEditingDescription = writable(false)
	let isEditingAssignee = writable(false)
	let isEditingAcceptanceCriteria = writable(false)
	let isEditingStepsToReproduce = writable(false)
	let isEditingTechnicalNotes = writable(false)
	let isEditingLabels = writable(false)

	async function updateTicket(id: string, updatedFields: Partial<TicketData>) {
		try {
			const updatedTicket = await pb.collection('tickets').update(id, updatedFields)
			ticket = { ...ticket, ...updatedFields }
			toast.success('Ticket updated successfully')
		} catch (error) {
			console.error('Error updating ticket:', error)
			toast.error('Failed to update ticket')
		}
	}

	function startEditing(field: string) {
		if (field === 'title') isEditingTitle.set(true)
		else if (field === 'description') isEditingDescription.set(true)
		else if (field === 'assignee') isEditingAssignee.set(true)
		else if (field === 'acceptance_criteria') isEditingAcceptanceCriteria.set(true)
		else if (field === 'steps_to_reproduce') isEditingStepsToReproduce.set(true)
		else if (field === 'technical_notes') isEditingTechnicalNotes.set(true)
		else if (field === 'labels') isEditingLabels.set(true)
	}

	function cancelEdit(field: string) {
		if (field === 'title') isEditingTitle.set(false)
		else if (field === 'description') isEditingDescription.set(false)
		else if (field === 'assignee') isEditingAssignee.set(false)
		else if (field === 'acceptance_criteria') isEditingAcceptanceCriteria.set(false)
		else if (field === 'steps_to_reproduce') isEditingStepsToReproduce.set(false)
		else if (field === 'technical_notes') isEditingTechnicalNotes.set(false)
		else if (field === 'labels') isEditingLabels.set(false)
	}

	async function handleSaveEdit(field: string, value: any) {
		await updateTicket(ticket.id, { [field]: value })
		cancelEdit(field)
	}

	async function handleStatusChange(event) {
		const newStatus = event.detail.value
		if (newStatus !== ticket.status) {
			await updateTicket(ticket.id, { status: newStatus })
		}
	}

	async function handlePriorityChange(event) {
		const newPriority = event.detail.value
		if (newPriority !== ticket.priority) {
			await updateTicket(ticket.id, { priority: newPriority })
		}
	}
</script>

<div class="container mx-auto p-4 flex flex-col lg:flex-row items-stretch">
	<div class="w-full lg:w-1/2 lg:pr-4 min-w-[300px]">
		<Card.Root class="w-full">
			<div class="space-y-4">
				<div class="flex flex-col">
					<EditableField
						value={ticket.title}
						isEditing={$isEditingTitle}
						fieldType="input"
						id={`edit-title-${ticket.id}`}
						on:startEdit={() => startEditing('title')}
						on:cancelEdit={() => cancelEdit('title')}
						on:saveEdit={({ detail }) => handleSaveEdit('title', detail)}
						class="max-w-full"
					/>

					<EditableField
						value={ticket.description}
						isEditing={$isEditingDescription}
						fieldType="textarea"
						id={`edit-description-${ticket.id}`}
						on:startEdit={() => startEditing('description')}
						on:cancelEdit={() => cancelEdit('description')}
						on:saveEdit={({ detail }) => handleSaveEdit('description', detail)}
						class="max-w-full"
					/>
				</div>

				<div class="flex space-x-4">
					<div class="flex items-center space-x-2">
						<h3 class="font-medium">Status:</h3>
						<Select
							items={TICKET_STATUSES}
							value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
							on:change={handleStatusChange}
						/>
					</div>

					<div class="flex items-center space-x-2">
						<h3 class="font-medium">Priority:</h3>
						<Select
							items={TICKET_PRIORITIES}
							value={TICKET_PRIORITIES.find((priority) => priority.value === ticket.priority)}
							on:change={handlePriorityChange}
						/>
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<h3 class="font-medium">Assignee:</h3>
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

				<div>
					<h3 class="font-medium">Labels:</h3>
					{#if $isEditingLabels}
						<EditableList
							items={ticket.labels}
							onSave={(newLabels) => handleSaveEdit('labels', newLabels)}
							onCancel={() => cancelEdit('labels')}
							title="Labels"
						/>
					{:else}
						<div class="flex flex-wrap">
							{#each ticket.labels as label}
								<Badge class="m-1">{label}</Badge>
							{/each}
						</div>
						<Button on:click={() => startEditing('labels')} variant="outline" class="mt-2">
							Edit Labels
						</Button>
					{/if}
				</div>

				<div>
					<h3 class="font-medium">Acceptance Criteria:</h3>
					{#if $isEditingAcceptanceCriteria}
						<EditableList
							items={ticket.acceptance_criteria}
							onSave={(newCriteria) => handleSaveEdit('acceptance_criteria', newCriteria)}
							onCancel={() => cancelEdit('acceptance_criteria')}
							title="Acceptance Criteria"
						/>
					{:else}
						<ul class="list-disc list-inside">
							{#each ticket.acceptance_criteria as criterion}
								<li>{criterion}</li>
							{/each}
						</ul>
						<Button
							on:click={() => startEditing('acceptance_criteria')}
							variant="outline"
							class="mt-2"
						>
							Edit Acceptance Criteria
						</Button>
					{/if}
				</div>

				<div>
					<h3 class="font-medium">Steps to Reproduce:</h3>
					{#if $isEditingStepsToReproduce}
						<EditableList
							items={ticket.steps_to_reproduce}
							onSave={(newSteps) => handleSaveEdit('steps_to_reproduce', newSteps)}
							onCancel={() => cancelEdit('steps_to_reproduce')}
							title="Steps to Reproduce"
						/>
					{:else}
						<ol class="list-decimal list-inside">
							{#each ticket.steps_to_reproduce as step}
								<li>{step}</li>
							{/each}
						</ol>
						<Button
							on:click={() => startEditing('steps_to_reproduce')}
							variant="outline"
							class="mt-2"
						>
							Edit Steps to Reproduce
						</Button>
					{/if}
				</div>

				<div>
					<h3 class="font-medium">Technical Notes:</h3>
					{#if $isEditingTechnicalNotes}
						<EditableList
							items={ticket.technical_notes}
							onSave={(newNotes) => handleSaveEdit('technical_notes', newNotes)}
							onCancel={() => cancelEdit('technical_notes')}
							title="Technical Notes"
						/>
					{:else}
						<ul class="list-disc list-inside">
							{#each ticket.technical_notes as note}
								<li>{note}</li>
							{/each}
						</ul>
						<Button on:click={() => startEditing('technical_notes')} variant="outline" class="mt-2">
							Edit Technical Notes
						</Button>
					{/if}
				</div>
			</div>
		</Card.Root>
	</div>
</div>
