import { json } from '@sveltejs/kit'
import { OPENAI_KEY } from '$env/static/private'
import type { RequestHandler } from '@sveltejs/kit'
import { getTokens } from '$lib/tokenizer'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
// This endpoint generates a bug ticket based on the provided ticket description.

const viteEnvironment = import.meta.env.VITE_ENVIRONMENT

const openai = new OpenAI({
	apiKey: OPENAI_KEY
})

// zod schema for Ticket
const Ticket = z.object({
	title: z.string(),
	description: z.string(),
	acceptance_criteria: z.array(z.string()),
	steps_to_reproduce: z.array(z.string()),
	technical_notes: z.array(z.string()),
	priority: z.enum(['low', 'medium', 'high']),
	labels: z.array(z.string()),
	assignee: z.string()
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json()
		const ticketDescription = data.prompt

		let inputTokenCount = getTokens(ticketDescription)

		if (inputTokenCount >= 4000) {
			return json({ error: 'Query exceeds the 4000 token limit' }, { status: 400 })
		}

		// TODO: completions.parse() is in beta. Update when live.
		const completion = await openai.beta.chat.completions.parse({
			model: viteEnvironment === 'dev' ? 'gpt-4o-2024-08-06' : 'gpt-4o-mini-2024-07-18',
			messages: [
				{
					role: 'system',
					content: `You are a virtual assistant specialized in creating detailed issue tickets for various industries. Based on the user's ticketDescription, generate a comprehensive issue ticket. Use a relevant team or department as the assignee, such as Development Team, QA Team, UI/UX Team, Support Team, Operations Team, Maintenance Team, or Customer Service Team.`
				},
				{
					role: 'user',
					content: ticketDescription
				}
			],
			response_format: zodResponseFormat(Ticket, 'ticket') // response should reflect schema
		})

		const responseData = completion.choices[0].message.parsed
		const totalTokensUsed = inputTokenCount + (completion.usage ? completion.usage.total_tokens : 0)

		console.log('responseData:', responseData)
		console.log('totalTokensUsed:', totalTokensUsed)

		return json({ data: responseData })
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to generate bug ticket' }, { status: 500 })
	}
}
