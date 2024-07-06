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

	$: ({ user, tickets } = data)

	$: console.log('user', user)

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

	$: console.log('ticketData', $ticketData)
	$: console.log('user', user)

	const refreshTicketList = async () => {
		const updatedTickets = await pb.collection('tickets').getList(1, 50, {
			filter: `user="${user.id}"`,
			sort: '-created'
		})

		// Map the response to TicketData type
		tickets = updatedTickets.items.map(mapRecordToTicketData)
	}

	const saveTicket = async () => {
		console.log('saveTicket called')
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

			console.log('ticket in saveTicket', ticket)
			console.log('record in saveTicket', record)

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

	$: console.log('tickets', tickets)
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

		<h2 class="text-xl lg:text-2xl font-bold pt-6 pb-2 text-orange-700 dark:text-orange-400">
			{tickets.length} Tickets
		</h2>

		{#each tickets as ticket}
			<TicketListItem {ticket} {deleteTicket} {updateTicket} />
		{/each}
	</div>
	<div class="w-1/2 lg:w-1/2 lg:pl-4 mt-4 lg:mt-0">
		{#if isProcessing}
			<div class="flex justify-center items-center h-screen">
				<Loading />
			</div>
		{/if}
		{#if $ticketData}
			<TicketCard ticketData={$ticketData} {saveTicket} {hasTicketSaved} />
		{/if}
	</div>
</div>
