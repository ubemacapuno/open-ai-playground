import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { mapRecordToTicketData } from '$lib/utils'
import type { TicketData } from '../ticket-generator-types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		throw error(401, 'You must be logged in to view ticket details.')
	}

	const ticketId = event.params.ticketId

	try {
		const ticket = await event.locals.pb.collection('tickets').getOne(ticketId, {
			filter: `user="${event.locals.user.id}"`
		})

		if (!ticket) {
			throw error(404, 'Ticket not found')
		}

		const mappedTicket: TicketData = mapRecordToTicketData(ticket)
		console.log('Ticket:', mappedTicket)

		return {
			user: event.locals.user,
			ticket: mappedTicket
		}
	} catch (err) {
		console.error('Error fetching ticket:', err)
		throw error(500, 'An error occurred while fetching the ticket')
	}
}
