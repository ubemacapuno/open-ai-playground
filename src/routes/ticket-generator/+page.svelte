<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { writable } from 'svelte/store'
	import * as Card from '$lib/components/ui/card'
	import Loading from '$lib/components/Loading.svelte'
	import { toast } from 'svelte-sonner'
	import { Textarea } from '$lib/components/ui/textarea'
	import type { PageData } from './$types'
	import { pb } from '$lib/pocketbase'
	import type { TicketData } from './ticket-generator-types'
	import TicketCard from './TicketCard.svelte'
	import TicketListItem from './TicketListItem.svelte'
	import { mapRecordToTicketData } from '$lib/utils'

	export let data: PageData

	$: ({ user, tickets, example_ticket } = data)

	// Ticket Vars
	let ticketDescription = ''
	let ticketData = writable<TicketData | null>(null)
	let isProcessing = false
	let hasTicketSaved = false

	const onTicketSubmit = async () => {
		if (!ticketDescription.trim()) {
			toast.error('Error', { description: 'Ticket description cannot be empty.' })
			return
		}
		const requestBody = JSON.stringify({ prompt: ticketDescription })
		isProcessing = true
		const response = await fetch('/api/ticket-generator', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: requestBody
		})

		if (response.ok) {
			const result = await response.json()
			ticketData.set(result.data)
			isProcessing = false
			hasTicketSaved = false
			toast.success('Ticket Generated', {
				description: 'The ticket has been generated successfully.'
			})
		} else {
			isProcessing = false
			ticketData.set(example_ticket) // create a blank ticket if it fails (ex: offline mode/API down)
			const errorResponse = await response.json()
			console.error('Failed to generate ticket:', errorResponse.error)
			toast.error('Error generating ticket', {
				description: errorResponse.error || 'Unknown error occurred'
			})
		}
	}

	const resetTicketData = () => {
		ticketData.set(null)
		ticketDescription = ''
		hasTicketSaved = false
	}

	$: isSubmitDisabled = isProcessing || !ticketDescription.trim()

	const refreshTicketList = async () => {
		const updatedTickets = await pb.collection('tickets').getList(1, 50, {
			filter: `user="${user.id}"`,
			sort: '-created'
		})

		// Map the response to TicketData type
		tickets = updatedTickets.items.map(mapRecordToTicketData)
	}

	const saveTicket = async () => {
		const ticket = $ticketData
		if (!ticket) return

		try {
			const record = await pb.collection('tickets').create({
				title: ticket.title,
				description: ticket.description,
				acceptance_criteria: ticket.acceptance_criteria,
				steps_to_reproduce: ticket.steps_to_reproduce,
				technical_notes: ticket.technical_notes,
				priority: ticket.priority,
				labels: ticket.labels,
				assignee: ticket.assignee,
				user: user.id,
				status: 'open'
			})

			// Refresh the tickets list
			await refreshTicketList()

			hasTicketSaved = true
			toast.success('Ticket Saved', { description: 'The ticket has been saved successfully.' })
		} catch (error) {
			console.error('Error saving ticket:', error)
			toast.error('Error Saving Ticket', {
				description: 'An error occurred while saving the ticket.'
			})
		}
	}

	const deleteTicket = async (ticketId: string) => {
		try {
			await pb.collection('tickets').delete(ticketId)
			toast.success('Ticket Deleted', { description: 'The ticket has been deleted successfully.' })
			await refreshTicketList()
		} catch (error) {
			console.error('Error deleting ticket:', error)
			toast.error('Error Deleting Ticket', {
				description: 'An error occurred while deleting the ticket.'
			})
		}
	}

	const updateTicket = async (ticketId: string, updatedFields: Partial<TicketData>) => {
		try {
			await pb.collection('tickets').update(ticketId, updatedFields)
			toast.success('Ticket Updated', { description: 'The ticket has been updated successfully.' })
			await refreshTicketList()
		} catch (error) {
			console.error('Error updating ticket:', error)
			toast.error('Error Updating Ticket', {
				description: 'An error occurred while updating the ticket.'
			})
		}
	}
</script>

<div class="container mx-auto p-4 flex flex-col lg:flex-row">
	<div class="w-1/2 lg:w-1/2 lg:pr-4">
		<Card.Root class="w-full">
			<Card.Header>
				<Card.Title>
					<h2 class="text-xl lg:text-2xl font-bold">Ticket Generator</h2>
				</Card.Title>
				<Card.Description>
					<p class="text-sm lg:text-base">Generate a ticket based on a description.</p>
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Textarea
					bind:value={ticketDescription}
					class="textarea textarea-bordered w-full h-40 mb-4 text-sm lg:text-base"
					placeholder="Enter your ticket description here."
				/>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button on:click={onTicketSubmit} disabled={isSubmitDisabled} class="text-sm lg:text-base">
					Generate Ticket
				</Button>
				<Button
					on:click={resetTicketData}
					variant="outline"
					disabled={isProcessing}
					class="text-sm lg:text-base"
				>
					Reset
				</Button>
			</Card.Footer>
		</Card.Root>

		{#if tickets.length}
			<div class="border rounded-lg shadow-md my-3 h-[calc(100vh-30rem)] overflow-y-auto">
				<div
					class="sticky top-0 z-10 p-4 bg-card bg-opacity-75 backdrop-blur-lg backdrop-filter border-b"
				>
					<h2 class="text-xl lg:text-2xl font-bold text-orange-700 dark:text-orange-400">
						{tickets.length}
						{tickets.length !== 1 ? 'Tickets' : 'Ticket'}
					</h2>
				</div>
				{#each tickets as ticket}
					<div class="py-2 px-4">
						<TicketListItem {ticket} {deleteTicket} {updateTicket} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="p-4 border rounded-lg shadow-md my-4 h-[calc(100vh-30rem)]">
				<div class="flex justify-center items-center h-full">
					<h2 class="text-xl">No tickets found! 🤷‍♂️</h2>
				</div>
			</div>
		{/if}
	</div>
	<div class="w-1/2 lg:w-1/2 lg:pl-4 mt-4 lg:mt-0">
		{#if isProcessing}
			<div class="flex justify-center items-center h-screen">
				<Loading />
			</div>
		{/if}
		{#if $ticketData}
			<!-- TODO: Redo/test logic and implement `hasTicketSaved` -->
			<TicketCard ticketData={$ticketData} {saveTicket} />
		{:else}
			<div class="py-4 border rounded-lg shadow-md h-[calc(100vh-6rem)]">
				<div class="flex justify-center items-center h-1/4">
					<h2 class="text-xl">Generate a ticket! 🤖</h2>
				</div>
			</div>
		{/if}
	</div>
</div>
