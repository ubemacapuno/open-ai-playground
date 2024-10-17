import { pb } from '$lib/pocketbase'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = pb

	// load the auth store from the cookie if it exists
	const cookie = event.request.headers.get('cookie') || ''

	event.locals.pb.authStore.loadFromCookie(cookie)

	// set auth'd user in locals object
	if (event.locals.pb.authStore.isValid) {
		event.locals.user = structuredClone(event.locals.pb.authStore.model)
	} else {
		console.log('No valid auth store found')
	}

	const response = await resolve(event)

	// save the auth store to the cookie if it's valid
	if (event.locals.pb.authStore.isValid) {
		const authCookie = event.locals.pb.authStore.exportToCookie({
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/'
		})
		response.headers.append('Set-Cookie', authCookie)
	}

	return response
}
