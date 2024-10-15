import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	// If the user is already authenticated, redirect to the home page
	if (locals.pb.authStore.isValid) {
		throw redirect(303, '/')
	}
}

export const actions: Actions = {
	traditional: async ({ locals, request }) => {
		const data = Object.fromEntries(await request.formData()) as {
			email: string
			password: string
			passwordConfirm: string
		}

		try {
			await locals.pb.collection('users').create(data)
			await locals.pb.collection('users').authWithPassword(data.email, data.password)
		} catch (e) {
			console.error(e)
			throw e
		}

		throw redirect(303, '/')
	},
	OAuth2: async ({ cookies, url, locals }) => {
		const authMethods = await locals.pb?.collection('users').listAuthMethods()
		if (!authMethods) {
			return {
				authProviders: ''
			}
		}

		const redirectURL = `${url.origin}/oauth`
		const googleAuthProvider = authMethods.authProviders[0]
		const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`

		const state = googleAuthProvider.state
		const verifier = googleAuthProvider.codeVerifier
		// Ensure the state and verifier are set correctly
		if (!state || !verifier) {
			console.error('State or Verifier is missing, cannot set cookies.')
			throw redirect(303, '/register')
		}

		// Set state and verifier in cookies with the required path option
		cookies.set('state', state, { path: '/', secure: false })
		cookies.set('verifier', verifier, { path: '/', secure: false })

		// Log the cookies immediately after setting them
		console.log('Cookies after setting:', cookies.getAll())

		const expectedState = cookies.get('state')
		const expectedVerifier = cookies.get('verifier')

		console.log('expectedState in page server:', expectedState)
		console.log('expectedVerifier:', expectedVerifier)

		// Ensure the state is also logged for debugging
		console.log('Setting state in cookies:', state)
		console.log('Setting verifier in cookies:', verifier)

		throw redirect(302, authProviderRedirect)
	}
}
