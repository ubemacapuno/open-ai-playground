import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	// If the user is already authenticated, redirect to the home page
	if (locals.pb.authStore.isValid) {
		throw redirect(303, '/')
	}
}

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const data = Object.fromEntries(await request.formData()) as {
			email: string
			password: string
		}

		try {
			await locals.pb.collection('users').authWithPassword(data.email, data.password)
		} catch (e) {
			console.error(e)
			throw e
		}

		console.log('data:', data)

		redirect(303, '/')
	}
}
