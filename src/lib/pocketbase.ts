import PocketBase from 'pocketbase'
import { PUBLIC_POCKETBASE_URL } from '$env/static/public'

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL)

pb.autoCancellation(false)

if (typeof window !== 'undefined') {
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
