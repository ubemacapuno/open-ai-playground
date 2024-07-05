<script lang="ts">
	// import Badge from '$lib/components/ui/badge/badge.svelte'
	import { toTitleCase } from '../../utilities/transform'
	import { Button } from '$lib/components/ui/button'
	import type { TicketData } from './ticket-generator-types'
	import { Trash2 } from 'lucide-svelte'
	import { ExternalLink } from 'lucide-svelte'

	export let ticket: TicketData
	export let deleteTicket: (id: string) => void

	$: console.log('ticket id:', ticket.id)
	$: console.log('ticket:', ticket)
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

			<Button type="submit" size="icon" class="text-sm" variant="ghost">
				<ExternalLink size={16} />
			</Button>
		</div>
	</div>
	<!-- TODO: Show additional fields in a modal when clicked -->
	<!-- <p>{ticket.description}</p> -->

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

	<div class="mt-4 flex flex-wrap space-x-4 justify-between">
		<div class="flex flex-col">
			<h3 class="font-medium text-orange-700 dark:text-orange-400">Status:</h3>
			<p>{toTitleCase(ticket.status)}</p>
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
