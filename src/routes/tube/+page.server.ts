import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { handleLoginRedirect } from '$lib/utils'

const viteEnvironment = import.meta.env.VITE_ENVIRONMENT

export const load: PageServerLoad = async (event) => {
	if (viteEnvironment !== 'dev') {
		throw redirect(302, '/') // TODO: Remove redirect when page is ready
	}

	if (!event.locals.user) {
		throw redirect(
			302,
			handleLoginRedirect(event, 'You must be logged in to access the tube page.')
		)
	}

	return {
		user: event.locals.user
	}
}
