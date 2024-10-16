import { redirect } from '@sveltejs/kit'

export const GET = async ({ locals, url, cookies }) => {
	const redirectURL = `${url.origin}/oauth`
	const expectedState = cookies.get('state')
	const expectedVerifier = cookies.get('verifier')

	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')

	console.log('Expected state from cookie:', expectedState)
	console.log('Received state from URL:', state)

	if (!expectedState || expectedState !== state) {
		console.error('Invalid state: ', expectedState, state)
		throw redirect(303, '/register')
	}

	if (!code || !expectedVerifier) {
		console.error('Missing code or verifier')
		throw redirect(303, '/register')
	}

	try {
		const authMethods = await locals.pb?.collection('users').listAuthMethods()
		const provider = authMethods?.authProviders[0]

		if (!provider) {
			throw new Error('No auth provider found')
		}

		const authData = await locals.pb
			.collection('users')
			.authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL)

		// Explicitly update the auth store
		locals.pb.authStore.save(authData.token, authData.record)

		// Store the user data in locals
		locals.user = authData.record

		console.log('User authenticated:', locals.user)
		console.log('Auth store after authentication:', locals.pb.authStore)

		// Set the auth cookie
		const authCookie = locals.pb.authStore.exportToCookie({
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/'
		})

		console.log('Setting auth cookie:', authCookie)

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
				'Set-Cookie': authCookie
			}
		})
	} catch (err) {
		console.error('Error signing in with OAuth2', err)
		throw redirect(303, '/register')
	}
}
