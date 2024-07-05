<script lang="ts">
	import * as Card from '$lib/components/ui/card'
	import { Button } from '$lib/components/ui/button'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { toTitleCase } from '../../utilities/transform'
	import type { TicketData } from './ticket-generator-types'

	export let ticketData: TicketData
	export let saveTicket: () => void
</script>

<Card.Root class="w-full rounded-lg p-4 shadow-md">
	<Card.Header>
		<Card.Title class="text-lg lg:text-xl font-semibold">{ticketData.title}</Card.Title>
	</Card.Header>
	<Card.Content class="text-sm lg:text-base">
		<p>{ticketData.description}</p>
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Acceptance Criteria:</h3>
		<ul class="list-disc list-inside">
			{#each ticketData.acceptance_criteria as criterion}
				<li>{criterion}</li>
			{/each}
		</ul>
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Steps to Reproduce:</h3>
		<ul class="list-disc list-inside">
			{#each ticketData.steps_to_reproduce as step}
				<li>{step}</li>
			{/each}
		</ul>
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Technical Notes:</h3>
		<ul class="list-disc list-inside">
			{#each ticketData.technical_notes as note}
				<li>{note}</li>
			{/each}
		</ul>
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Priority:</h3>
		<p
			class:text-green-700={ticketData.priority === 'Low'}
			class:text-yellow-600={ticketData.priority === 'Medium'}
			class:text-red-600={ticketData.priority === 'High'}
		>
			{toTitleCase(ticketData.priority)}
		</p>
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Labels:</h3>
		<div class="flex flex-wrap">
			{#each ticketData.labels as label}
				<div class="m-1">
					<Badge>{label}</Badge>
				</div>
			{/each}
		</div>
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Assignee:</h3>
		<p>{ticketData.assignee}</p>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<Button type="submit" on:click={saveTicket} class="text-sm lg:text-base">Save Ticket</Button>
	</Card.Footer>
</Card.Root>
