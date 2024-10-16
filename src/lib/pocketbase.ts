import PocketBase from 'pocketbase'
import { PUBLIC_POCKETBASE_URL } from '$env/static/public'

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL)

// Disable auto cancellation
pb.autoCancellation(false)

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
	// Client-side only code
	pb.authStore.loadFromCookie(document.cookie)
	pb.authStore.onChange(() => {
		document.cookie = pb.authStore.exportToCookie({
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			path: '/'
		})
	})
}
