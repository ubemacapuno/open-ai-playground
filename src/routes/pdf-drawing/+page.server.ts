import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { handleLoginRedirect } from '$lib/utils'

const viteEnvironment = import.meta.env.VITE_ENVIRONMENT

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(
			302,
			handleLoginRedirect(event, 'You must be logged in to access the Drawing Parser page.')
		)
	}

	const isProd = viteEnvironment === 'prod'

	return {
		user: event.locals.user,
		isProd
	}
}
