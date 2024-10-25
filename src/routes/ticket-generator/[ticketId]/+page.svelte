<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import * as Card from '$lib/components/ui/card'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from '../ticket-generator-types'
	import Select from '../Select.svelte'
	import { TICKET_PRIORITIES, TICKET_STATUSES } from '$lib/constants'
	import EditableField from '../EditableField.svelte'
	import EditableList from '../EditableList.svelte'
	import { toast } from 'svelte-sonner'
	import type { PageData } from '../$types'
	import { Pencil } from 'lucide-svelte'

	export let data: PageData

	$: ({ ticket } = data)

	let isEditingTitle = writable(false)
	let isEditingDescription = writable(false)
	let isEditingAssignee = writable(false)
	let isEditingAcceptanceCriteria = writable(false)
	let isEditingStepsToReproduce = writable(false)
	let isEditingTechnicalNotes = writable(false)
	let isEditingLabels = writable(false)

	async function updateTicket(id: string, updatedFields: Partial<TicketData>) {
		try {
			ticket = { ...ticket, ...updatedFields }
			toast.success('Ticket updated successfully')
		} catch (error) {
			console.error('Error updating ticket:', error)
			toast.error('Failed to update ticket')
		}
	}

	function toggleEditing(field: string) {
		if (field === 'title') isEditingTitle.update((v) => !v)
		else if (field === 'description') isEditingDescription.update((v) => !v)
		else if (field === 'assignee') isEditingAssignee.update((v) => !v)
		else if (field === 'acceptance_criteria') isEditingAcceptanceCriteria.update((v) => !v)
		else if (field === 'steps_to_reproduce') isEditingStepsToReproduce.update((v) => !v)
		else if (field === 'technical_notes') isEditingTechnicalNotes.update((v) => !v)
		else if (field === 'labels') isEditingLabels.update((v) => !v)
	}

	async function handleSaveEdit(field: string, value: any) {
		await updateTicket(ticket.id, { [field]: value })
		toggleEditing(field)
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

<div class="container mx-auto p-4 space-y-4">
	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('title')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingTitle ? 'Cancel editing title' : 'Edit title'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Ticket Title</h2>
		<EditableField
			value={ticket.title}
			isEditing={$isEditingTitle}
			fieldType="input"
			id={`edit-title-${ticket.id}`}
			on:startEdit={() => toggleEditing('title')}
			on:cancelEdit={() => toggleEditing('title')}
			on:saveEdit={({ detail }) => handleSaveEdit('title', detail)}
			class="max-w-full"
		/>
	</Card.Root>

	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('description')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingDescription ? 'Cancel editing description' : 'Edit description'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Description</h2>
		<EditableField
			value={ticket.description}
			isEditing={$isEditingDescription}
			fieldType="textarea"
			id={`edit-description-${ticket.id}`}
			on:startEdit={() => toggleEditing('description')}
			on:cancelEdit={() => toggleEditing('description')}
			on:saveEdit={({ detail }) => handleSaveEdit('description', detail)}
			class="max-w-full"
		/>
	</Card.Root>

	<Card.Root class="p-4">
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Status and Priority</h2>
		<div class="flex flex-col gap-2">
			<div class="flex items-center">
				<h3 class="font-medium mr-2 text-orange-700 dark:text-orange-400">Status:</h3>
				<Select
					items={TICKET_STATUSES}
					value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
					on:change={handleStatusChange}
				/>
			</div>

			<div class="flex items-center">
				<h3 class="font-medium mr-2 text-orange-700 dark:text-orange-400">Priority:</h3>
				<Select
					items={TICKET_PRIORITIES}
					value={TICKET_PRIORITIES.find((priority) => priority.value === ticket.priority)}
					on:change={handlePriorityChange}
				/>
			</div>
		</div>
	</Card.Root>

	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('assignee')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingAssignee ? 'Cancel editing assignee' : 'Edit assignee'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Assignee</h2>
		<div class="flex items-center space-x-2">
			<h3 class="font-medium">Assignee:</h3>
			<EditableField
				value={ticket.assignee}
				isEditing={$isEditingAssignee}
				fieldType="input"
				id={`edit-assignee-${ticket.id}`}
				on:startEdit={() => toggleEditing('assignee')}
				on:cancelEdit={() => toggleEditing('assignee')}
				on:saveEdit={({ detail }) => handleSaveEdit('assignee', detail)}
			/>
		</div>
	</Card.Root>

	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('labels')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingLabels ? 'Cancel editing labels' : 'Edit labels'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Labels</h2>
		{#if $isEditingLabels}
			<EditableList
				items={ticket.labels}
				onSave={(newLabels) => handleSaveEdit('labels', newLabels)}
				onCancel={() => toggleEditing('labels')}
				title="Labels"
			/>
		{:else}
			<div class="flex flex-wrap">
				{#each ticket.labels as label}
					<Badge class="m-1">{label}</Badge>
				{/each}
			</div>
		{/if}
	</Card.Root>

	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('acceptance_criteria')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingAcceptanceCriteria
				? 'Cancel editing acceptance criteria'
				: 'Edit acceptance criteria'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Acceptance Criteria</h2>
		{#if $isEditingAcceptanceCriteria}
			<EditableList
				items={ticket.acceptance_criteria}
				onSave={(newCriteria) => handleSaveEdit('acceptance_criteria', newCriteria)}
				onCancel={() => toggleEditing('acceptance_criteria')}
				title="Acceptance Criteria"
			/>
		{:else}
			<ul class="list-disc list-inside">
				{#each ticket.acceptance_criteria as criterion}
					<li>{criterion}</li>
				{/each}
			</ul>
		{/if}
	</Card.Root>

	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('steps_to_reproduce')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingStepsToReproduce
				? 'Cancel editing steps to reproduce'
				: 'Edit steps to reproduce'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Steps to Reproduce</h2>
		{#if $isEditingStepsToReproduce}
			<EditableList
				items={ticket.steps_to_reproduce}
				onSave={(newSteps) => handleSaveEdit('steps_to_reproduce', newSteps)}
				onCancel={() => toggleEditing('steps_to_reproduce')}
				title="Steps to Reproduce"
			/>
		{:else}
			<ol class="list-decimal list-inside">
				{#each ticket.steps_to_reproduce as step}
					<li>{step}</li>
				{/each}
			</ol>
		{/if}
	</Card.Root>

	<Card.Root class="p-4 relative">
		<Button
			on:click={() => toggleEditing('technical_notes')}
			variant="ghost"
			size="icon"
			class="absolute top-2 right-2"
			aria-label={$isEditingTechnicalNotes
				? 'Cancel editing technical notes'
				: 'Edit technical notes'}
		>
			<Pencil class="h-4 w-4" />
		</Button>
		<h2 class="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400">Technical Notes</h2>
		{#if $isEditingTechnicalNotes}
			<EditableList
				items={ticket.technical_notes}
				onSave={(newNotes) => handleSaveEdit('technical_notes', newNotes)}
				onCancel={() => toggleEditing('technical_notes')}
				title="Technical Notes"
			/>
		{:else}
			<ul class="list-disc list-inside">
				{#each ticket.technical_notes as note}
					<li>{note}</li>
				{/each}
			</ul>
		{/if}
	</Card.Root>
</div>
