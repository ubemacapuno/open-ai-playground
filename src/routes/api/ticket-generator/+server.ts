import { json } from '@sveltejs/kit'
import { OPENAI_KEY } from '$env/static/private'
import type { RequestHandler } from '@sveltejs/kit'
import { getTokens } from '$lib/tokenizer'
import OpenAI from 'openai'

// This endpoint generates a bug ticket based on the provided ticket description.

const openai = new OpenAI({
	apiKey: OPENAI_KEY
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json()
		const ticketDescription = data.prompt

		let inputTokenCount = getTokens(ticketDescription)

		if (inputTokenCount >= 4000) {
			return json({ error: 'Query exceeds the 4000 token limit' }, { status: 400 })
		}

		const openaiResponse = await openai.chat.completions.create({
			model: 'gpt-4o-2024-05-13',
			messages: [
				{
					role: 'system',
					content: `You are a virtual software development assistant. Based on the user's ticketDescription, create a detailed bug ticket. Return the data in a JSON structure like this:
                  {
                    "Title": "string",
                    "Description": "string",
                    "AcceptanceCriteria": [
                      "string"
                    ],
                    "StepsToReproduce": [
                      "string"
                    ],
                    "TechnicalNotes": [
                      "string"
                    ],
                    "Priority": "Low" | "Medium" | "High",
                    "Labels": [
                      "string"
                    ],
                    "Assignee": "string"
                  }`
				},
				{
					role: 'user',
					content: ticketDescription
				}
			]
		})

		let responseText = openaiResponse.choices[0].message.content
		if (responseText) {
			responseText = responseText
				.replace(/```json/g, '')
				.replace(/```/g, '')
				.trim()
		}

		const responseData = JSON.parse(responseText as string)
		const totalTokensUsed =
			inputTokenCount + (openaiResponse.usage ? openaiResponse.usage.total_tokens : 0)

		console.log('responseData:', responseData)
		console.log('tokensUsed:', totalTokensUsed)

		return json({ data: responseData })
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to generate bug ticket' }, { status: 500 })
	}
}
