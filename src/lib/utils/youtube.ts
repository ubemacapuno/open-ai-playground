import { YoutubeTranscript } from 'youtube-transcript';

// Functions for grabbing the youtube video and extracting the transcript

export function getYouTubeVideoId(url: string): string | null {
	const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[7].length === 11 ? match[7] : null;
}

export interface TranscriptItem {
	text: string;
	duration: number;
	offset: number;
	lang?: string;
}

export async function getYouTubeTranscript(videoId: string): Promise<TranscriptItem[]> {
	try {
		const transcript = await YoutubeTranscript.fetchTranscript(videoId);
		console.log('Raw Transcript log: ', transcript);
		return transcript;
	} catch (error) {
		console.error('Error fetching transcript:', error);
		throw error;
	}
}
