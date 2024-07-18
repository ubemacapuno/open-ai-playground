<script lang="ts">
	import { toTitleCase } from '../../utilities/transform'
	import { Button } from '$lib/components/ui/button'
	import type { TicketData } from './ticket-generator-types'
	import { writable } from 'svelte/store'
	import { Trash2 } from 'lucide-svelte'
	import TicketDrawer from './TicketDrawer.svelte'
	import Select from './Select.svelte'
	import { TICKET_PRIORITIES, TICKET_STATUSES } from '$lib/constants'

	export let ticket: TicketData
	export let deleteTicket: (id: string) => void
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>

	let isEditingTitle = writable(false)
	let isEditingDescription = writable(false)
	let isEditingAcceptanceCriteria = writable(false)
	let editingCriteriaIndex = writable(-1)

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

	function handleDrawerClose() {
		isEditingTitle.set(false)
		isEditingDescription.set(false)
		isEditingAcceptanceCriteria.set(false)
		editingCriteriaIndex.set(-1)
	}
</script>

<div class="p-4 border rounded-lg shadow-md mb-4">
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
		</div>
	</div>

	<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Status:</h3>
			<Select
				items={TICKET_STATUSES}
				value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
				on:change={(event) => handleFieldChange('status', event)}
			/>
		</div>

		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Priority:</h3>
			<Select
				items={TICKET_PRIORITIES}
				value={TICKET_PRIORITIES.find((priority) => priority.value === ticket.priority)}
				on:change={(event) => handleFieldChange('priority', event)}
			/>
		</div>

		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Assignee:</h3>
			<p>{ticket.assignee}</p>
		</div>
	</div>
</div>
