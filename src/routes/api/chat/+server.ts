import { OPENAI_KEY } from '$env/static/private'
import type { RequestHandler } from '@sveltejs/kit'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import OpenAI from 'openai'

const viteEnvironment = import.meta.env.VITE_ENVIRONMENT

type ChatMessage = {
	role: 'user' | 'assistant' | 'system' | 'function'
	content: string
}

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: OPENAI_KEY
})

const MAX_TOKENS = 4000
const MAX_TRANSCRIPT_TOKENS = 2000

function formatTimestamp(offset: number): string {
	/**
	 * convert offset (seconds) to HH:MM:SS format for timestamps.
	 * Example shape of the transcript:
	[
		{
				text: 'watching and I will see you in the next',
				duration: 4.879,
				offset: 145.72,
				lang: 'en'
		},
	]
	 */
	const hours = Math.floor(offset / 3600)
	const minutes = Math.floor((offset % 3600) / 60)
	const seconds = Math.floor(offset % 60)

	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const POST: RequestHandler = async ({ request }) => {
	// Safeguard check for environment
	if (viteEnvironment !== 'dev') {
		return json({ error: 'Endpoint not available in production' }, { status: 403 }) // TODO: Remove when ready for prod
	}

	try {
		if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('No request data')
		}

		const { messages: reqMessages, transcript } = requestData

		if (!reqMessages) {
			throw new Error('no messages provided')
		}

		// format transcript with clear timestamps
		const transcriptText = transcript
			.map((item: any) => {
				const timestamp = formatTimestamp(item.offset)
				return `[${timestamp}] ${item.text}`
			})
			.join('\n')

		const transcriptTokens = getTokens(transcriptText)
		console.log('\n=== TOKEN USAGE BREAKDOWN ===')
		console.log('Transcript tokens:', transcriptTokens)

		let truncatedTranscript = transcript
		if (transcriptTokens > MAX_TRANSCRIPT_TOKENS) {
			truncatedTranscript = transcript.slice(
				0,
				Math.floor(transcript.length * (MAX_TRANSCRIPT_TOKENS / transcriptTokens))
			)
			console.log(
				`⚠️  Truncated transcript from ${transcript.length} to ${truncatedTranscript.length} items`
			)
			console.log(
				`Original tokens: ${transcriptTokens}, New tokens: ${getTokens(
					truncatedTranscript
						.map(
							(item: any) => `[${new Date(item.offset).toISOString().substr(11, 8)}] ${item.text}`
						)
						.join('\n')
				)}`
			)
		}

		// Calculate conversation tokens
		let conversationTokens = 0
		reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content)
			conversationTokens += tokens
			console.log(`Message (${msg.role}) tokens:`, tokens)
		})
		console.log('Total conversation tokens:', conversationTokens)

		// create system message with transcript context
		const systemMessage = {
			role: 'system',
			content: `You are a virtual assistant analyzing a YouTube video. Below is the transcript with timestamps in HH:MM:SS format:

${transcriptText}

When answering questions, please reference specific timestamps HH:MM:SS from the transcript when relevant to help users navigate to specific parts of the video.`
		}

		const systemTokens = getTokens(systemMessage.content)
		console.log('System message tokens:', systemTokens)

		const totalTokens = transcriptTokens + conversationTokens + systemTokens
		console.log('\n=== TOTAL TOKEN USAGE ===')
		console.log(
			`Total tokens: ${totalTokens} / ${MAX_TOKENS} (${((totalTokens / MAX_TOKENS) * 100).toFixed(1)}%)`
		)
		console.log('Breakdown:')
		console.log(
			`- Transcript: ${transcriptTokens} tokens (${((transcriptTokens / totalTokens) * 100).toFixed(1)}%)`
		)
		console.log(
			`- Conversation: ${conversationTokens} tokens (${((conversationTokens / totalTokens) * 100).toFixed(1)}%)`
		)
		console.log(
			`- System: ${systemTokens} tokens (${((systemTokens / totalTokens) * 100).toFixed(1)}%)`
		)
		console.log('========================\n')

		if (totalTokens >= MAX_TOKENS) {
			console.error('❌ Token limit exceeded:', totalTokens, '/', MAX_TOKENS)
			throw new Error('Total context exceeds token limit')
		}

		const messages: ChatMessage[] = [systemMessage, ...reqMessages]
		const remainingTokens = MAX_TOKENS - totalTokens
		console.log(`Remaining tokens for response: ${remainingTokens}`)

		// create chat completion with streaming
		const stream = await openai.chat.completions.create({
			model: 'gpt-4o-2024-08-06',
			messages,
			temperature: 0.3,
			max_tokens: Math.min(200, remainingTokens),
			stream: true
		})

		// create a new ReadableStream for SSE
		const sseStream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of stream) {
						if (chunk.choices[0]?.delta?.content) {
							const message = {
								choices: [
									{
										delta: {
											content: chunk.choices[0].delta.content
										}
									}
								]
							}
							controller.enqueue(`data: ${JSON.stringify(message)}\n\n`)
						}
					}
					controller.enqueue('data: [DONE]\n\n')
					controller.close()
				} catch (error) {
					controller.error(error)
				}
			}
		})

		console.log('✅ Request completed successfully')
		return new Response(sseStream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		})
	} catch (err) {
		console.error('❌ Error:', err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}
