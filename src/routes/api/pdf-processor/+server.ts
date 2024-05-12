// src/routes/api/pdf-processor/+server.ts
import { json } from '@sveltejs/kit';
import { OPENAI_KEY } from '$env/static/private';
import { PDFExtract, type PDFExtractResult } from 'pdf.js-extract';
import type { RequestHandler } from '@sveltejs/kit';
import { getTokens } from '$lib/tokenizer';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.formData();
		const file = data.get('file') as File;
		const pdfExtract = new PDFExtract();
		const buffer = await file.arrayBuffer();

		// Extract text from PDF
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

		// OpenAI API fetch configuration
		const openaiRequestOptions = {
			model: 'gpt-3.5-turbo-instruct',
			prompt: `Extract the Part Number, Description, and Revision from the following text: "${pdfText}"`,
			max_tokens: 100,
			temperature: 0.5
		};

		const openaiResponse = await fetch('https://api.openai.com/v1/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(openaiRequestOptions)
		});

		const openaiData = await openaiResponse.json();

		if (!openaiResponse.ok) {
			throw new Error(openaiData.error.message || 'Failed to connect to OpenAI API');
		}

		// Logging token usage
		const totalTokensUsed =
			inputTokenCount + (openaiData.usage ? openaiData.usage.total_tokens : 0);
		console.log(
			`Total tokens used: ${totalTokensUsed} (Input: ${inputTokenCount}, Response: ${openaiData.usage ? openaiData.usage.total_tokens : 0})`
		);

		return json({ data: openaiData.choices[0].text, tokensUsed: totalTokensUsed });
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to process PDF' }, { status: 500 });
	}
};
