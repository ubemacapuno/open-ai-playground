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

		const extractedPdfData: PDFExtractResult = await pdfExtract.extractBuffer(buffer, {});
		let pdfText = '';
		extractedPdfData.pages.forEach((page) => {
			page.content.forEach((item) => {
				pdfText += item.str + ' ';
			});
		});

		let inputTokenCount = getTokens(pdfText);
		// Increase if necessary; capping for now
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

		const responseText = openaiData.choices[0].text.trim();
		const partNumberMatch = responseText.match(/Part Number:\s*(\d+)/i);
		const descriptionMatch = responseText.match(/Description:\s*([^\n]+)/i);
		const revisionMatch = responseText.match(/Revision:\s*([A-Z]+)/i);

		// Shape the response data
		// TODO: See if OpenAI can return structured data directly (add this to the prompt?) so we don't have to do this part:
		const structuredPdfData = {
			part_number: partNumberMatch ? partNumberMatch[1] : null,
			description: descriptionMatch ? descriptionMatch[1].trim() : null,
			revision: revisionMatch ? revisionMatch[1] : null
		};

		const totalTokensUsed =
			inputTokenCount + (openaiData.usage ? openaiData.usage.total_tokens : 0);
		console.log(
			`Total tokens used: ${totalTokensUsed} (Input: ${inputTokenCount}, Response: ${openaiData.usage ? openaiData.usage.total_tokens : 0})`
		);

		return json({ data: structuredPdfData, tokensUsed: totalTokensUsed });
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to process PDF' }, { status: 500 });
	}
};
