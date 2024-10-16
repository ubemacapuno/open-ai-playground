import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	// If the user is already authenticated, redirect to the home page
	if (locals.pb.authStore.isValid) {
		throw redirect(303, '/')
	}
}

export const actions: Actions = {
	OAuth2: async ({ cookies, url, locals }) => {
		try {
			const authMethods = await locals.pb?.collection('users').listAuthMethods()
			if (!authMethods) {
				return fail(500, { message: 'Unable to retrieve auth methods' })
			}

			const redirectURL = `${url.origin}/oauth`
			const googleAuthProvider = authMethods.authProviders[0]
			const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`

			const state = googleAuthProvider.state
			const verifier = googleAuthProvider.codeVerifier

			if (!state || !verifier) {
				console.error('State or Verifier is missing, cannot set cookies.')
				return fail(500, { message: 'Authentication setup failed' })
			}

			// Set cookies with appropriate options
			cookies.set('state', state, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production'
			})
			cookies.set('verifier', verifier, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production'
			})

			console.log('Setting state cookie:', state)

			// Instead of throwing a redirect, return it
			return { redirect: authProviderRedirect }
		} catch (error) {
			console.error('Error in OAuth2 action:', error)
			return fail(500, { message: 'An unexpected error occurred' })
		}
	}
}
