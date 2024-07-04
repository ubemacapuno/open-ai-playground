import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	// If the user is already authenticated, redirect to the home page
	if (locals.pb.authStore.isValid) {
		throw redirect(303, '/')
	}
}

export const actions: Actions = {
	default: async (event) => {
		const data = Object.fromEntries(await event.request.formData()) as {
			email: string
			password: string
		}

		try {
			await event.locals.pb.collection('users').authWithPassword(data.email, data.password)
		} catch (e) {
			console.error(e)
			throw e
		}

		// grab the redirectTo query param
		// if the user was redirected to the login page, redirect them back to the page they were on
		const redirectTo = event.url.searchParams.get('redirectTo')
		if (redirectTo) {
			throw redirect(302, `/${redirectTo.slice(1)}`)
		}
		redirect(303, '/')
	}
}
