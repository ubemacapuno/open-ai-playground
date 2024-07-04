import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { handleLoginRedirect } from '$lib/utils'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(
			302,
			handleLoginRedirect(event, 'You must be logged in to access the Bug Ticket Generator page.')
		)
	}

	return {
		user: event.locals.user
	}
}
