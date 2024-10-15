import { redirect } from '@sveltejs/kit'

export const GET = async ({ locals, url, cookies }) => {
	console.log('All Cookies in GET:', cookies.getAll()) // Log all cookies for debugging
	console.log('url.searchParams:', url.searchParams)
	const redirectURL = `${url.origin}/oauth`
	const expectedState = cookies.get('state')
	const expectedVerifier = cookies.get('verifier')
	console.log('expected verifier be buggin?', expectedVerifier)

	console.log('All Cookies Before Retrieval:', cookies.getAll()) // Log all cookies for debugging
	console.log('Expected State:', expectedState) // Should log the expected state

	const state = url.searchParams.get('state') // Get state from searchParams
	const code = url.searchParams.get('code')

	console.log('Returned State:', state)
	console.log('Returned Code', code)

	// Check if expectedState is still undefined
	if (!expectedState) {
		console.error('Expected State is undefined. Check if the cookie is set correctly.')
	}

	const authMethods = await locals.pb?.collection('users').listAuthMethods()
	if (!authMethods?.authProviders) {
		console.log('No Auth Providers')
		throw redirect(303, '/register')
	}

	const provider = authMethods.authProviders[0]
	if (!provider) {
		console.log('Provider Not Found')
		throw redirect(303, '/register')
	}

	if (expectedState !== state) {
		console.log('Returned State Does Not Match Expected', expectedState, state)
		throw redirect(303, '/register')
	}

	try {
		if (code && expectedVerifier) {
			await locals.pb
				?.collection('users')
				.authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL, {
					name: 'My Awesome User'
				})
		} else {
			console.log('Code or Verifier is null', code, expectedVerifier)
			throw redirect(303, '/register')
		}
	} catch (err) {
		console.log('Error Signing Up With OAuth2', err)
	}

	throw redirect(303, '/')
}
