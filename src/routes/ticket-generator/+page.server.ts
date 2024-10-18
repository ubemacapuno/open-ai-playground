import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { handleLoginRedirect, mapRecordToTicketData } from '$lib/utils'
import type { TicketData } from './ticket-generator-types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(
			302,
			handleLoginRedirect(event, 'You must be logged in to access the Ticket Generator page.')
		)
	}
	// Grab the first 50 tickets created by the logged-in user
	const tickets = await event.locals.pb.collection('tickets').getList(1, 50, {
		filter: `user="${event.locals.user?.id}"`,
		sort: '-created'
	})

	const example_ticket = {
		title: 'Example: Test Ticket',
		description: 'Save and edit this ticket with real issue details.',
		acceptance_criteria: ['Update this list with your actual acceptance criteria'],
		steps_to_reproduce: ['Replace with the actual reproduction steps for your issue'],
		technical_notes: ['Add your own technical notes and findings here'],
		priority: 'medium',
		labels: ['example'],
		assignee: event.locals.user?.email || 'me',
		status: 'open'
	}

	// Map the response to TicketData type
	const mappedTickets: TicketData[] = tickets.items.map(mapRecordToTicketData)

	return {
		user: event.locals.user,
		tickets: mappedTickets,
		example_ticket
	}
}
