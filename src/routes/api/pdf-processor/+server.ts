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

		const openaiResponse = await openai.chat.completions.create({
			model: 'gpt-4-turbo-2024-04-09',
			messages: [
				{
					role: 'system',
					content:
						'You are a manufacturing engineer assistant. Extract and respond with the Part Number, Description, Revision, and a list of succinct recommended operations (like milling, galvanizing, laser cutting, bead blasting, etc.) based on the materials and details provided. Return the data in a JSON structure like this: {"part_number": "<Part/Drawing Number>", "description": "<Description/Title>", "revision": "<Revision Number/Letter>", "operations": ["<Operation1>", "<Operation2>", ...]} Don\'t return the result encapsulated in ``` Part Number is an alphanumeric string that can be found in the lower right part of the PDF. It is displayed prominently, usually in a box. It is generally near words like "Part Number", "PN", "Document Number", "Part #", or something similar. It is usually the largest font size in the area. When there are multiple sheets in the PDF, the Part Number is usually displayed in the same location on every sheet. Description is an alphanumeric string that can be found in the lower right part of the PDF. It is displayed slightly less prominently than the Part Number, usually in a box. It is generally near words like "Description", "Title", "Document Name", "Part Name", "Name", or something similar. It is usually an average font size. It is usually longer than the Part Number and may have multiple words. When there are multiple sheets in the PDF, the Description is usually displayed in the same location on every sheet. No prefix is needed for this, such as "Assembly Drawing:". Revision is an alphanumeric string that can be found in the bottom right part of the drawing, near the part number or description fields. It is typically in a box that only contains the revision under or near words like "Rev". It is usually 1-3 characters and is different from the "Size" field which is also in the lower right and labeled SIZE. The revision number is usually displayed in a slightly less prominent font than the Part Number. Ensure you do not confuse the revision number with the size field or other labels.'
				},
				{
					role: 'user',
					content: pdfText
				}
			]
		})

		console.log('pdfText: ', pdfText)
		console.log('openaiResponse:', openaiResponse)
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

		console.log('responseText:', responseData)
		console.log('tokensUsed:', totalTokensUsed)

		return json({ data: responseText, tokensUsed: totalTokensUsed })
	} catch (error) {
		console.error(error)
		return json({ error: 'Failed to process PDF' }, { status: 500 })
	}
}
