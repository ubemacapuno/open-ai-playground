import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { getYouTubeVideoId, getYouTubeTranscript } from '$lib/utils/youtube'

const viteEnvironment = import.meta.env.VITE_ENVIRONMENT

export const POST: RequestHandler = async ({ request }) => {
	// if (viteEnvironment !== 'dev') {
	// 	return json({ error: 'Endpoint not available in production' }, { status: 403 })
	// }

	try {
		const { url } = await request.json()
		const videoId = getYouTubeVideoId(url)

		if (!videoId) {
			return json({ error: 'Invalid YouTube URL' }, { status: 400 })
		}

		const transcript = await getYouTubeTranscript(videoId)
		return json({ transcript })
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to fetch transcript' }, { status: 500 })
	}
}
