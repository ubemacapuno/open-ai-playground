<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte'
	import * as ParentCard from '$lib/components/ui/card'

	import TicketListItem from './ticket-generator/TicketListItem.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import DemoChatMessage from '$lib/components/DemoChatMessage.svelte'

	const demoTicket = {
		id: '',
		title: 'PDF upload not working correctly',
		description: '',
		acceptance_criteria: [],
		steps_to_reproduce: [],
		technical_notes: [],
		priority: 'Medium',
		labels: ['bug', 'frontend'],
		assignee: 'Dev. Team',
		status: 'In Progress'
	}

	const demoPdfData = {
		part_number: 'BR-2745-A',
		description: 'Brake Caliper Mount',
		revision: '102',
		operations: ['CNC Machining', 'Surface Grinding', 'Heat Treatment', 'Zinc Phosphate Coating']
	}
</script>

<section class="mx-auto max-w-[980px] pt-8 pb-2 md:pt-12 lg:pt-24">
	<h1
		class="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] mb-8"
	>
		OpenAI Playground
	</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<a href="/ticket-generator" class="flex" data-testid="bug-ticket-link">
			<Card class="p-6 flex flex-col justify-between w-full">
				<div>
					<h2 class="text-xl font-semibold mb-2 text-orange-700 dark:text-orange-400">
						Bug Ticket Generator
					</h2>
					<p class="mb-4">
						Automatically generate detailed bug tickets with AI assistance, streamlining your
						development workflow.
					</p>
				</div>
				<TicketListItem ticket={demoTicket} isDemo />
			</Card>
		</a>

		<a href="/tube" class="flex" data-testid="bug-ticket-link">
			<Card class="p-6 flex flex-col justify-between w-full">
				<div>
					<h2 class="text-xl font-semibold mb-2 text-orange-700 dark:text-orange-400">
						Video Assistant
					</h2>
					<p class="mb-4">
						Extract transcripts from YouTube videos and interact with an AI chatbot to summarize
						content and provide timestamps for key moments.
					</p>
					<div class="flex justify-start mb-2">
						<div class="chat-image avatar online z-0">
							<div class="user_avatar_wrapper bg-neutral-focus text-secondary w-10 rounded-full">
								<span class="text-xl">🤖</span>
							</div>
						</div>
						<DemoChatMessage
							message="This video covers the basics of Svelte, including components, reactivity, and state management."
						/>
					</div>
				</div>
			</Card>
		</a>

		<a href="/pdf-drawing" class="flex" data-testid="pdf-drawing-link">
			<Card class="p-6 flex flex-col justify-between w-full">
				<div>
					<h2 class="text-xl font-semibold mb-2 text-orange-700 dark:text-orange-400">
						PDF Drawing Parser
					</h2>
					<p class="mb-4">Extract and analyze CAD drawings from PDF documents with ease with AI.</p>
				</div>
				<ParentCard.Root class="w-full rounded-lg shadow-md">
					<ParentCard.Header>
						<ParentCard.Title
							>{demoPdfData.part_number
								? `Part Number: ${demoPdfData.part_number}`
								: ''}</ParentCard.Title
						>
						<ParentCard.Description
							>{demoPdfData.description
								? `Name: ${demoPdfData.description}`
								: ''}</ParentCard.Description
						>
						<ParentCard.Description
							>{demoPdfData.revision
								? `Revision: ${demoPdfData.revision}`
								: ''}</ParentCard.Description
						>
					</ParentCard.Header>
					<ParentCard.Content>
						{#if demoPdfData.operations && demoPdfData.operations.length > 0}
							<div class="my-1">
								<ul class="flex flex-wrap">
									{#each demoPdfData.operations as operation}
										<li class="m-1/2">
											<Badge class="mx-1">{operation}</Badge>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</ParentCard.Content>
				</ParentCard.Root>
			</Card>
		</a>
	</div>
</section>
