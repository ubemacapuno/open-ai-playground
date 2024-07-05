<script lang="ts">
	// import Badge from '$lib/components/ui/badge/badge.svelte'
	import { toTitleCase } from '../../utilities/transform'
	import { Button } from '$lib/components/ui/button'
	import type { TicketData } from './ticket-generator-types'

	export let ticket: TicketData
	export let deleteTicket: (id: string) => void
</script>

<!-- TODO: Show additional fields in a modal when clicked -->

<div class="p-4 border rounded-lg shadow-md mb-4">
	<h2 class="text-lg font-semibold">{ticket.title}</h2>

	<!-- <p>{ticket.description}</p> -->

	<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Status:</h3>
	<p>{toTitleCase(ticket.status)}</p>

	<!-- {#if ticket.acceptance_criteria}
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Acceptance Criteria:</h3>
		<ul class="list-disc list-inside">
			{#each ticket.acceptance_criteria as criterion}
				<li>{criterion}</li>
			{/each}
		</ul>
	{/if}

	{#if ticket.steps_to_reproduce}
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Steps to Reproduce:</h3>
		<ul class="list-disc list-inside">
			{#each ticket.steps_to_reproduce as step}
				<li>{step}</li>
			{/each}
		</ul>
	{/if}

	{#if ticket.technical_notes}
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Technical Notes:</h3>
		<ul class="list-disc list-inside">
			{#each ticket.technical_notes as note}
				<li>{note}</li>
			{/each}
		</ul>
	{/if} -->

	<!-- {#if ticket.labels}
		<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Labels:</h3>
		<div class="flex flex-wrap">
			{#each ticket.labels as label}
				<div class="m-1">
					<Badge>{label}</Badge>
				</div>
			{/each}
		</div>
	{/if} -->

	<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Assignee:</h3>
	<p>{ticket.assignee}</p>

	<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Priority:</h3>
	<p
		class:text-green-700={ticket.priority === 'Low'}
		class:text-yellow-600={ticket.priority === 'Medium'}
		class:text-red-600={ticket.priority === 'High'}
	>
		{toTitleCase(ticket.priority)}
	</p>

	<Button type="submit" on:click={() => deleteTicket(ticket.id)} class="text-sm lg:text-base">
		Delete Ticket
	</Button>
</div>
