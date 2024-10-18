<script lang="ts">
	import { writable } from 'svelte/store'
	import { Button } from '$lib/components/ui/button'
	import { ChevronsUpDown } from 'lucide-svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import type { TicketData } from '../ticket-generator-types'
	import { tick } from 'svelte'
	import Select from '../Select.svelte'
	import { TICKET_PRIORITIES, TICKET_STATUSES } from '$lib/constants'
	import EditableField from '../EditableField.svelte'
	import EditableList from '../EditableList.svelte'
	import { pb } from '$lib/pocketbase'
	import { toast } from 'svelte-sonner'
	import type { PageData } from '../$types'

	export let data: PageData

	$: ({ user, ticket } = data)
	$: console.log('Ticket:', ticket)
</script>

<p>Ticket Title: {ticket.title}</p>
