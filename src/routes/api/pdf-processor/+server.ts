import { json } from '@sveltejs/kit'
import { OPENAI_KEY } from '$env/static/private'
import { PDFExtract, type PDFExtractResult } from 'pdf.js-extract'
import type { RequestHandler } from '@sveltejs/kit'
import { getTokens } from '$lib/tokenizer'
import OpenAI from 'openai'

// This endpoint processes a PDF file drawing and extracts the Part Number, Description, Revision, and a list of recommended operations based on the materials and details provided.

const openai = new OpenAI({
	apiKey: OPENAI_KEY
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.formData()
		const file = data.get('file') as File
		const pdfExtract = new PDFExtract()
		const buffer = Buffer.from(await file.arrayBuffer())

		const extractedPdfData: PDFExtractResult = await pdfExtract.extractBuffer(buffer, {})
		let pdfText = ''

		// TODO: Determine if we should process all pages or just the first page of the PDF

		// Process all pages of the PDF
		// extractedPdfData.pages.forEach((page) => {
		// 	page.content.forEach((item) => {
		// 		pdfText += item.str + ' ';
		// 	});
		// });

		// Process only the first two pages of the PDF
		const pagesToProcess = 2
		for (let i = 0; i < Math.min(pagesToProcess, extractedPdfData.pages.length); i++) {
			extractedPdfData.pages[i].content.forEach((item) => {
				pdfText += item.str + ' '
			})
		}

		let inputTokenCount = getTokens(pdfText)

		if (inputTokenCount >= 4000) {
			throw new Error(`Query exceeds the 4000 token limit. Token count was ${inputTokenCount}.`)
		}

		const openaiResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-1106',
			messages: [
				{
					role: 'system',
					content:
						'You are a manufacturing engineer assistant. Extract and respond with the Part Number, Description, Revision, and a list of succinct recommended operations (like milling, galvanizing, laser cutting, bead blasting, etc.) based on the materials and details provided. Return the data in a JSON structure like this: {"part_number": "<Part/Drawing Number>", "description": "<Description/Title>", "revision": "<Revision Number/Letter>", "operations": ["<Operation1>", "<Operation2>", ...]}'
				},
				{
					role: 'user',
					content: pdfText
				}
			]
		})

		console.log('openaiResponse:', openaiResponse)
		let responseText = openaiResponse.choices[0].message.content
		if (responseText) {
			responseText = responseText
				.replace(/```json/g, '')
				.replace(/```/g, '')
				.trim()
		}

		console.log('responseText:', responseText)
		const responseData = JSON.parse(responseText as string)

		console.log('responseData:', responseData)

		const totalTokensUsed =
			inputTokenCount + (openaiResponse.usage ? openaiResponse.usage.total_tokens : 0)

		console.log(
			`Total tokens used: ${totalTokensUsed} (Input: ${inputTokenCount}, Response: ${openaiResponse.usage ? openaiResponse.usage.total_tokens : 0})`
		)

		console.log('responseText:', responseData)
		console.log('tokensUsed:', totalTokensUsed)

		return json({ data: responseText, tokensUsed: totalTokensUsed })
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to process PDF' }, { status: 500 })
	}
}
