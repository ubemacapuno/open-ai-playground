import { json } from '@sveltejs/kit'
import { OPENAI_KEY } from '$env/static/private'
import Papa from 'papaparse'
import type { RequestHandler } from '@sveltejs/kit'
import OpenAI from 'openai'
import { getTokens } from '$lib/tokenizer'

// This endpoint processes a CSV file and generates TypeScript types based on the structure of the CSV rows.
const viteEnvironment = import.meta.env.VITE_ENVIRONMENT

const openai = new OpenAI({
	apiKey: OPENAI_KEY
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData()
		const file = formData.get('file') as File

		if (!file || file.type !== 'text/csv') {
			return json({ error: 'Invalid file type. Please upload a CSV file.' }, { status: 400 })
		}

		const text = await file.text()
		const { data, errors } = Papa.parse(text, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true
		})

		if (errors.length) {
			return json({ errors }, { status: 400 })
		}

		if (data.length === 0) {
			return json({ error: 'No data found in CSV file.' }, { status: 400 })
		}

		const firstRow = data[0] as Record<string, any>
		const fields = Object.keys(firstRow)
			.map((key) => `${key}: ${typeof firstRow[key]}`)
			.join(', ')

		let inputTokenCount = getTokens(fields)

		if (inputTokenCount >= 4000) {
			throw new Error(`Query exceeds the 4000 token limit. Token count was ${inputTokenCount}.`)
		}

		const openaiResponse = await openai.chat.completions.create({
			model: viteEnvironment === 'dev' ? 'gpt-4o-2024-08-06' : 'gpt-4o-mini-2024-07-18',
			messages: [
				{
					role: 'system',
					content:
						'Generate a TypeScript interface based on the provided CSV row structure. Start by suggesting a relevant type name that reflects the data content or theme, then define the type with the appropriate fields. Use the following format for the type definition, and ensure there are no titles or prefixes before the type definition:\n\nExample:\ntype RowData = {\n  id?: number;\n  name?: string;\n}\n\nYour task:'
				},
				{
					role: 'user',
					content: `{\n${fields}\n}`
				}
			]
		})

		if (!openaiResponse || !openaiResponse.choices || openaiResponse.choices.length === 0) {
			return json({ error: 'Failed to generate TypeScript types' }, { status: 500 })
		}
		let responseText = openaiResponse.choices[0].message.content
		if (responseText) {
			responseText = responseText
				.replace(/\btypescript\b\s*/gi, '') // Removes any "typescript" prefix
				.replace(/```json/g, '')
				.replace(/```/g, '')
				.trim()
		}

		const totalTokensUsed =
			inputTokenCount + (openaiResponse.usage ? openaiResponse.usage.total_tokens : 0)

		console.log(
			`Total tokens used: ${totalTokensUsed} (Input: ${inputTokenCount}, Response: ${openaiResponse.usage ? openaiResponse.usage.total_tokens : 0})`
		)

		return json({
			message: 'CSV parsed and TypeScript types generated successfully.',
			typeDefinition: responseText
		})
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to process CSV' }, { status: 500 })
	}
}
