<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { toTitleCase } from '../../utilities/transform'
	import { Button } from '$lib/components/ui/button'
	import type { TicketData } from './ticket-generator-types'
	import * as Drawer from '$lib/components/ui/drawer/index.js'
	import { writable } from 'svelte/store'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import { tick } from 'svelte'
	import { Check } from 'lucide-svelte'
	import { CircleX } from 'lucide-svelte'
	import { Trash2 } from 'lucide-svelte'
	import { ExternalLink } from 'lucide-svelte'

	export let ticket: TicketData
	export let deleteTicket: (id: string) => void
	export let updateTicket: (id: string, updatedFields: Partial<TicketData>) => Promise<void>

	let isEditingTitle = writable(false)
	let newTitle = writable(ticket.title)
	let isEditingDescription = writable(false)
	let newDescription = writable(ticket.description)

	async function startEditing(field: 'title' | 'description') {
		if (field === 'title') {
			isEditingTitle.set(true)
		} else {
			isEditingDescription.set(true)
		}
		await tick() // Wait for the DOM to update
		document.getElementById(`edit-${field}-${ticket.id}`)?.focus()
	}

	function cancelEdit(field: 'title' | 'description') {
		if (field === 'title') {
			newTitle.set(ticket.title)
			isEditingTitle.set(false)
		} else {
			newDescription.set(ticket.description)
			isEditingDescription.set(false)
		}
	}

	async function saveField(field: 'title' | 'description', value: string) {
		try {
			await updateTicket(ticket.id, { [field]: value })
			ticket[field] = value
			if (field === 'title') {
				isEditingTitle.set(false)
			} else {
				isEditingDescription.set(false)
			}
		} catch (error) {
			console.error(`Error updating ticket ${field}:`, error)
		}
	}

	function handleDrawerClose() {
		isEditingTitle.set(false)
		isEditingDescription.set(false)
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

			<!-- Ticket Drawer -->
			<Drawer.Root onOpenChange={handleDrawerClose}>
				<Drawer.Trigger asChild let:builder>
					<Button builders={[builder]} type="submit" size="icon" class="text-sm" variant="ghost">
						<ExternalLink size={16} />
					</Button>
				</Drawer.Trigger>
				<Drawer.Content>
					<div class="drawer-content-wrapper mx-auto w-full max-w-full px-8">
						<Drawer.Header>
							<Drawer.Title>
								{#if $isEditingTitle}
									<form
										on:submit|preventDefault={() => saveField('title', $newTitle)}
										class="flex flex-col space-y-2"
									>
										<div class="flex gap-2">
											<Input
												id={`edit-title-${ticket.id}`}
												type="text"
												bind:value={$newTitle}
												class="w-full text-lg font-semibold"
											/>
											<div class="flex space-x-2">
												<Button type="submit" size="sm" class="text-sm p-1" variant="ghost"
													><Check size={16} color="#22c55e" /></Button
												>
												<Button
													type="button"
													on:click={() => cancelEdit('title')}
													size="sm"
													class="text-sm p-1"
													variant="ghost"><CircleX size={16} color="#ef4444" /></Button
												>
											</div>
										</div>
									</form>
								{:else}
									<span
										role="button"
										tabindex="0"
										on:click={() => startEditing('title')}
										on:keydown={(event) => event.key === 'Enter' && startEditing('title')}
									>
										{ticket.title}
									</span>
								{/if}
							</Drawer.Title>
							<Drawer.Description>
								{#if $isEditingDescription}
									<form
										on:submit|preventDefault={() => saveField('description', $newDescription)}
										class="flex flex-col space-y-2"
									>
										<div class="flex gap-2">
											<Textarea
												id={`edit-description-${ticket.id}`}
												bind:value={$newDescription}
												class="w-full text-sm font-semibold"
											/>
											<div class="flex space-x-2">
												<Button type="submit" size="sm" class="text-sm p-1" variant="ghost"
													><Check size={16} color="#22c55e" /></Button
												>
												<Button
													type="button"
													on:click={() => cancelEdit('description')}
													size="sm"
													class="text-sm p-1"
													variant="ghost"><CircleX size={16} color="#ef4444" /></Button
												>
											</div>
										</div>
									</form>
								{:else}
									<span
										role="button"
										tabindex="0"
										on:click={() => startEditing('description')}
										on:keydown={(event) => event.key === 'Enter' && startEditing('description')}
									>
										{ticket.description}
									</span>
								{/if}
							</Drawer.Description>
						</Drawer.Header>

						{#if ticket.acceptance_criteria}
							<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">
								Acceptance Criteria:
							</h3>
							<ul class="list-disc list-inside">
								{#each ticket.acceptance_criteria as criterion}
									<li>{criterion}</li>
								{/each}
							</ul>
						{/if}

						{#if ticket.steps_to_reproduce}
							<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">
								Steps to Reproduce:
							</h3>
							<ul class="list-disc list-inside">
								{#each ticket.steps_to_reproduce as step}
									<li>{step}</li>
								{/each}
							</ul>
						{/if}

						{#if ticket.technical_notes}
							<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">
								Technical Notes:
							</h3>
							<ul class="list-disc list-inside">
								{#each ticket.technical_notes as note}
									<li>{note}</li>
								{/each}
							</ul>
						{/if}

						{#if ticket.labels}
							<h3 class="mt-4 font-medium text-orange-700 dark:text-orange-400">Labels:</h3>
							<div class="flex flex-wrap">
								{#each ticket.labels as label}
									<div class="m-1">
										<Badge>{label}</Badge>
									</div>
								{/each}
							</div>
						{/if}
						<Drawer.Footer>
							<Drawer.Close asChild let:builder>
								<Button builders={[builder]} variant="outline">Close</Button>
							</Drawer.Close>
						</Drawer.Footer>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>

	<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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

<style>
	.drawer-content-wrapper {
		max-height: 80vh;
		overflow-y: auto;
	}
</style>
