import { encode, isWithinTokenLimit, encodeChat } from 'gpt-tokenizer/model/gpt-4o'

/* Tokenizer for ChatGPT
 - Used for counting tokens (gpt-4o)
 - Can help prevent token count from exceeding the limit
*/

type ChatMessage = {
	role: 'system' | 'user' | 'assistant'
	content: string
}

export function getTokens(input: string): number {
	const tokens = encode(input)
	return tokens.length
}
