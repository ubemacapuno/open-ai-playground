import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ locals }) => {
		console.log('RUNNING LOGOUT ACTION')
		locals.pb.authStore.clear()
		locals.user = null
		console.log('LOCALS AFTER LOGOUT ACTION: ', locals)
		console.log('redirecting to /')
		redirect(303, '/')
	}
}
