import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ locals, cookies, setHeaders }) => {
		// Action to clear the auth store and any cookies
		locals.pb.authStore.clear()
		locals.user = null

		cookies.delete('state', { path: '/' })
		cookies.delete('verifier', { path: '/' })
		cookies.delete('pb_auth', { path: '/' })

		setHeaders({
			'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
			Pragma: 'no-cache',
			Expires: '0'
		})

		throw redirect(303, '/')
	}
}
