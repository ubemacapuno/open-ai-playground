import { json } from '@sveltejs/kit'
import { OPENAI_KEY } from '$env/static/private'
import { PDFExtract, type PDFExtractResult } from 'pdf.js-extract'
import type { RequestHandler } from '@sveltejs/kit'
import { getTokens } from '$lib/tokenizer'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

// This endpoint processes a PDF file drawing and extracts the Part Number, Description, Revision, and a list of recommended operations based on the materials and details provided.

const openai = new OpenAI({
	apiKey: OPENAI_KEY
})

const PDFExtraction = z.object({
	part_number: z.string(),
	description: z.string(),
	revision: z.string(),
	operations: z.array(z.string())
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.formData()
		const file = data.get('file') as File
		const pdfExtract = new PDFExtract()
		const buffer = Buffer.from(await file.arrayBuffer())

		const extractedPdfData: PDFExtractResult = await pdfExtract.extractBuffer(buffer, {})
		let pdfText = ''

		// Process all pages of the PDF
		extractedPdfData.pages.forEach((page) => {
			page.content.forEach((item) => {
				pdfText += item.str + ' '
			})
		})

		let inputTokenCount = getTokens(pdfText)

		if (inputTokenCount >= 4000) {
			return json({ error: 'Query exceeds the 4000 token limit' }, { status: 400 })
		}

		// TODO: completions.parse() is in beta. Update when live.
		const completion = await openai.beta.chat.completions.parse({
			model: 'gpt-4o-2024-08-06',
			messages: [
				{
					role: 'system',
					content:
						'You are a manufacturing engineer assistant. Extract the following from the PDF:\n1. Part Number: Alphanumeric string in lower right, prominently displayed, often boxed, near "Part Number", "PN", etc. Largest font in area.\n2. Description: Alphanumeric string in lower right, less prominent than Part Number, often boxed, near "Description", "Title", etc. Average font size, usually longer than Part Number.\n3. Revision: 1-3 character alphanumeric string in bottom right, near part number/description, typically in box labeled "Rev". Don\'t confuse with "Size".\n4. Operations: List of succinct recommended operations (e.g., milling, galvanizing, laser cutting) based on materials and details provided.\n\nFor multi-sheet PDFs, Part Number and Description are usually in the same location on each sheet. No prefixes needed for Description.'
				},
				{
					role: 'user',
					content: pdfText
				}
			],
			response_format: zodResponseFormat(PDFExtraction, 'pdf_extraction')
		})

		const responseData = completion.choices[0].message.parsed
		const totalTokensUsed = inputTokenCount + (completion.usage ? completion.usage.total_tokens : 0)

		console.log('responseData:', responseData)
		console.log('totalTokensUsed:', totalTokensUsed)

		return json({ data: responseData, tokensUsed: totalTokensUsed })
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to process PDF' }, { status: 500 })
	}
}
