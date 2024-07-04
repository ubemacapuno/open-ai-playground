import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { handleLoginRedirect } from '$lib/utils'
import PocketBase from 'pocketbase'
import { PUBLIC_POCKETBASE_URL } from '$env/static/public'

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
		filter: `user = "${event.locals.user.id}"`,
		sort: '-created'
	})

	return {
		user: event.locals.user,
		tickets: tickets.items // items is an array of ticket objects
	}
}
