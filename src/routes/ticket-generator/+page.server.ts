import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { handleLoginRedirect, mapRecordToTicketData } from '$lib/utils'
import PocketBase from 'pocketbase'
import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import type { TicketData } from './ticket-generator-types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(
			302,
			handleLoginRedirect(event, 'You must be logged in to access the Bug Ticket Generator page.')
		)
	}

	const pb = new PocketBase(PUBLIC_POCKETBASE_URL)

	// Grab the first 50 tickets created by the logged-in user
	const tickets = await pb.collection('tickets').getList(1, 50, {
		filter: `user="${event.locals.user.id}"`,
		sort: '-created'
	})

	// Map the response to TicketData type
	const mappedTickets: TicketData[] = tickets.items.map(mapRecordToTicketData)

	return {
		user: event.locals.user,
		tickets: mappedTickets // items is an array of ticket objects
	}
}
