<script lang="ts">
	import { toTitleCase } from '../../utilities/transform'
	import { Button } from '$lib/components/ui/button'
	import type { TicketData } from './ticket-generator-types'
	import { writable } from 'svelte/store'
	import { Trash2 } from 'lucide-svelte'
	import TicketDrawer from './TicketDrawer.svelte'
	import Select from './Select.svelte'
	import { TICKET_STATUSES } from '$lib/constants'

	export let ticket: TicketData
	export let deleteTicket: (id: string) => void
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>

	let isEditingTitle = writable(false)
	let isEditingDescription = writable(false)
	let isEditingAcceptanceCriteria = writable(false)
	let editingCriteriaIndex = writable(-1)

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

			<TicketDrawer {ticket} {updateTicket} {handleDrawerClose} />
		</div>
	</div>

	<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Status:</h3>
			<Select
				items={TICKET_STATUSES}
				value={TICKET_STATUSES.find((status) => status.value === ticket.status)}
				on:change={handleStatusChange}
			/>
		</div>

		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Priority:</h3>
			<p
				class:text-green-700={ticket.priority === 'low'}
				class:text-yellow-600={ticket.priority === 'medium'}
				class:text-red-600={ticket.priority === 'high'}
			>
				{toTitleCase(ticket.priority)}
			</p>
		</div>

		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Assignee:</h3>
			<p>{ticket.assignee}</p>
		</div>
	</div>
</div>
