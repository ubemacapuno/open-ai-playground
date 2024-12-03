import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { getYouTubeVideoId, getYouTubeTranscript } from '$lib/utils/youtube'

export const POST: RequestHandler = async ({ request }) => {
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
