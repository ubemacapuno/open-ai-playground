import { json } from '@sveltejs/kit';
import { OPENAI_KEY } from '$env/static/private';
import { PDFExtract, type PDFExtractResult } from 'pdf.js-extract';
import type { RequestHandler } from '@sveltejs/kit';
import { getTokens } from '$lib/tokenizer';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: OPENAI_KEY
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.formData();
		const file = data.get('file') as File;
		const pdfExtract = new PDFExtract();
		const buffer = await file.arrayBuffer();

		const extractedPdfData: PDFExtractResult = await pdfExtract.extractBuffer(buffer, {});
		let pdfText = '';
		extractedPdfData.pages.forEach((page) => {
			page.content.forEach((item) => {
				pdfText += item.str + ' ';
			});
		});

		let inputTokenCount = getTokens(pdfText);

		if (inputTokenCount >= 4000) {
			throw new Error('Query too large');
		}

		const openaiResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-1106',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant. Extract and respond with the Part Number, Description, and Revision from the text provided in a JSON structure like this: {"part_number": "<Part Number>", "description": "<Description>", "revision": "<Revision>"}'
				},
				{
					role: 'user',
					content: pdfText
				}
			]
		});

		console.log('openaiResponse:', openaiResponse);
		let responseText = openaiResponse.choices[0].message.content;
		responseText = responseText
			.replace(/```json/g, '')
			.replace(/```/g, '')
			.trim();

		console.log('responseText:', responseText);
		const responseData = JSON.parse(responseText);

		console.log('responseData:', responseData);

		// if (!openaiResponse.ok) {
		// 	throw new Error(openaiData.error.message || 'Failed to connect to OpenAI API');
		// }

		// Shape the response data
		// TODO: See if OpenAI can return structured data directly (add this to the prompt?) so we don't have to do this part:

		const totalTokensUsed =
			inputTokenCount + (openaiResponse.usage ? openaiResponse.usage.total_tokens : 0);
		console.log(
			`Total tokens used: ${totalTokensUsed} (Input: ${inputTokenCount}, Response: ${openaiResponse.usage ? openaiResponse.usage.total_tokens : 0})`
		);

		console.log('responseText:', responseData);
		console.log('tokensUsed:', totalTokensUsed);

		return json({ data: responseText, tokensUsed: totalTokensUsed });
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to process PDF' }, { status: 500 });
	}
};
