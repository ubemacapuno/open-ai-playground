<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { writable } from 'svelte/store'
	import * as Card from '$lib/components/ui/card'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
	import { toast } from 'svelte-sonner'
	import { toTitleCase } from '../../utilities/transform'
	import { Textarea } from '$lib/components/ui/textarea'
	import Badge from '$lib/components/ui/badge/badge.svelte'

	// Ticket Vars
	let ticketDescription = ''
	let ticketData = writable(null)
	let isProcessing = false

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
	}

	$: isSubmitDisabled = isProcessing || !ticketDescription.trim()
</script>

<div class="container mx-auto p-4 flex flex-col lg:flex-row">
	<div class="w-full lg:w-1/2 lg:pr-4">
		<Card.Root class="w-full">
			<Card.Header>
				<Card.Title>
					<h2 class="text-2xl font-bold">Ticket Generator</h2>
				</Card.Title>
				<Card.Description>
					<p>Generate a ticket based on a description.</p>
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Textarea
					bind:value={ticketDescription}
					class="textarea textarea-bordered w-full h-40 mb-4"
					placeholder="Enter your ticket description here."
				/>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button on:click={onTicketSubmit} disabled={isSubmitDisabled}>Generate Ticket</Button>
				<Button on:click={resetTicketData} variant="outline" disabled={isProcessing}>Reset</Button>
			</Card.Footer>
		</Card.Root>
	</div>
	<div class="w-full lg:w-1/2 lg:pl-4 mt-4 lg:mt-0">
		{#if isProcessing}
			<div class="flex justify-center items-center h-screen">
				<LoadingSpinner />
			</div>
		{/if}
		{#if $ticketData}
			<Card.Root class="w-full rounded-lg p-4 shadow-md">
				<Card.Header>
					<Card.Title>{$ticketData.Title}</Card.Title>
				</Card.Header>
				<Card.Content>
					<p>{$ticketData.Description}</p>
					<h3 class="mt-4">Acceptance Criteria:</h3>
					<ul>
						{#each $ticketData.AcceptanceCriteria as criterion}
							<li>{criterion}</li>
						{/each}
					</ul>
					<h3 class="mt-4">Steps to Reproduce:</h3>
					<ul>
						{#each $ticketData.StepsToReproduce as step}
							<li>{step}</li>
						{/each}
					</ul>
					<h3 class="mt-4">Technical Notes:</h3>
					<ul>
						{#each $ticketData.TechnicalNotes as note}
							<li>{note}</li>
						{/each}
					</ul>
					<h3 class="mt-4">Priority: {toTitleCase($ticketData.Priority)}</h3>
					<h3 class="mt-4">Labels:</h3>
					<div class="flex flex-wrap">
						{#each $ticketData.Labels as label}
							<div class="m-1">
								<Badge>{toTitleCase(label)}</Badge>
							</div>
						{/each}
					</div>
					<h3 class="mt-4">Assignee: {toTitleCase($ticketData.Assignee)}</h3>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>
