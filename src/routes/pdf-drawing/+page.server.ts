import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
// import { handleLoginRedirect } from '$lib/utils'

export const load: PageServerLoad = async ({ locals, event }) => {
	if (!locals.user) {
		redirect(302, '/login')
	}
	console.log('event:', event)
	// if (!event.locals.user) {
	// 	throw redirect(302, handleLoginRedirect(event))
	// }

	return {
		user: locals.user
	}
}
