import { pb } from '$lib/pocketbase'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = pb

	const response = await resolve(event)

	return response
}
