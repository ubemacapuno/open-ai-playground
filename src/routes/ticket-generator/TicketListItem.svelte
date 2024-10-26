<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import type { TicketData } from './ticket-generator-types'
	import { ExternalLink, Trash2 } from 'lucide-svelte'
	import TicketDrawer from './TicketDrawer.svelte'
	import Select from './Select.svelte'
	import { TICKET_PRIORITIES, TICKET_STATUSES } from '$lib/constants'
	import EditableField from './EditableField.svelte'

	export let isDemo = false
	export let ticket: TicketData
	export let deleteTicket: (id: string) => void
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>

	let isEditingAssignee = writable(false)

	async function startEditingAssignee() {
		isEditingAssignee.set(true)
	}

	function cancelEditingAssignee() {
		isEditingAssignee.set(false)
	}

	// TODO: combine handleSaveEditAssignee and handleFieldChange ?
	async function handleSaveEditAssignee(newValue: string) {
		if (newValue !== ticket.assignee) {
			try {
				await updateTicket(ticket.id, { assignee: newValue })
				ticket.assignee = newValue
				isEditingAssignee.set(false)
			} catch (error) {
				console.error(`Error updating ticket assignee:`, error)
				isEditingAssignee.set(false)
			}
		}
	}

	async function handleFieldChange(fieldName: 'status' | 'priority', event) {
		const newValue = event.detail.value
		if (newValue !== ticket[fieldName]) {
			try {
				await updateTicket(ticket.id, { [fieldName]: newValue })
				ticket[fieldName] = newValue
			} catch (error) {
				console.error(`Error updating ticket ${fieldName}:`, error)
			}
		}
	}
</script>

<div class="p-4 border rounded-lg shadow-md">
	<div class="flex justify-between">
		<h2 class="text-lg font-semibold truncate">{ticket.title}</h2>
		<div class="flex flex-row flex-nowrap">
			<Button
				type="submit"
				on:click={() => deleteTicket(ticket.id)}
				size="icon"
				class="text-sm"
				variant="ghost"
			>
				<Trash2 size={16} />
			</Button>
			<TicketDrawer {ticket} {updateTicket} />
			<Button as="a" href={`/ticket-generator/${ticket.id}`} variant="ghost" size="icon">
				<ExternalLink size={16} />
			</Button>
		</div>
	</div>

	<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Status:</h3>
			{#if isDemo}
				{ticket.status}
			{:else}
				<Select
					items={TICKET_STATUSES}
					value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
					on:change={(event) => handleFieldChange('status', event)}
				/>
			{/if}
		</div>

		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Priority:</h3>
			{#if isDemo}
				{ticket.priority}
			{:else}
				<Select
					items={TICKET_PRIORITIES}
					value={TICKET_PRIORITIES.find((priority) => priority.value === ticket.priority)}
					on:change={(event) => handleFieldChange('priority', event)}
				/>
			{/if}
		</div>

		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Assignee:</h3>
			{#if isDemo}
				{ticket.assignee}
			{:else}
				<EditableField
					value={ticket.assignee}
					isEditing={$isEditingAssignee}
					fieldType="input"
					id={`edit-title-${ticket.id}`}
					on:startEdit={() => startEditingAssignee()}
					on:cancelEdit={() => cancelEditingAssignee()}
					on:saveEdit={({ detail }) => handleSaveEditAssignee(detail)}
				/>
			{/if}
		</div>
	</div>
</div>
