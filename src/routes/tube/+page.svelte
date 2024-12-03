<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { TranscriptItem } from '$lib/utils/youtube'
	import { SSE } from 'sse.js'
	import { Input } from '$lib/components/ui/input'
	import { Button } from '$lib/components/ui/button'
	import { Card } from '$lib/components/ui/card'

	type ChatMessageType = {
		role: 'user' | 'assistant' | 'system' | 'function'
		content: string
		hidden?: boolean
	}

	let query: string = ''
	let answer: string = ''
	let isLoading: boolean = false
	let chatMessages: ChatMessageType[] = []
	let scrollToDiv: HTMLDivElement
	let youtubeUrl: string = ''
	let transcript: TranscriptItem[] | null = null // TODO: define TranscriptItem type

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	const handleSubmit = async () => {
		isLoading = true
		chatMessages = [...chatMessages, { role: 'user', content: query }]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({
				messages: chatMessages,
				transcript: transcript
			})
		})

		query = ''
		eventSource.addEventListener('error', handleError)
		eventSource.addEventListener('message', (e) => {
			scrollToBottom()
			try {
				isLoading = false
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
					answer = ''
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices
				if (delta.content) {
					answer = (answer ?? '') + delta.content
				}
			} catch (err) {
				handleError(err)
			}
		})

		eventSource.stream()
		scrollToBottom()
	}

	function handleError<T>(err: T) {
		isLoading = false
		query = ''
		answer = ''
		console.error(err)
	}

	async function handleTranscriptSubmit() {
		try {
			const response = await fetch('/api/transcript', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: youtubeUrl })
			})

			const data = await response.json()
			if (data.error) throw new Error(data.error)

			transcript = data.transcript

			// mark the initial message as hidden
			chatMessages = []
			query = 'Give a 3 sentence summary of the Youtube video with relevant timestamps'
			chatMessages = [...chatMessages, { role: 'user', content: query, hidden: true }] // TODO: This is still showing with hidden; true - fix

			await handleSubmit()
		} catch (error) {
			console.error(error)
			alert('Failed to fetch transcript')
		}
	}
</script>

<Card class="bg-neutral-focus mx-1 max-w-3xl shadow-xl">
	<div class="flex w-full flex-col items-start gap-2 px-2 py-4">
		<div>
			<h1 class="text-primary w-full text-center text-2xl font-bold">YouTube Video Assistant</h1>
		</div>

		<!-- YouTube URL Input -->
		<form
			class="bg-neutral-focus flex w-full gap-4 rounded-md p-4"
			on:submit|preventDefault={handleTranscriptSubmit}
		>
			<Input
				type="text"
				bind:value={youtubeUrl}
				placeholder="Enter YouTube URL..."
				class="input-bordered w-full"
			/>
			<Button type="submit" class="btn btn-primary" disabled={!youtubeUrl.trim()}>
				Load Video
			</Button>
		</form>

		<!-- show chat if transcript is loaded -->
		{#if transcript}
			<div class="bg-neutral flex h-[500px] w-full flex-col gap-4 overflow-y-auto rounded-md p-4">
				<div class="flex flex-col gap-2">
					{#each chatMessages as message}
						{#if !message.hidden}
							<ChatMessage type={message.role} message={message.content} />
							{message.hidden ? 'This should be hidden' : ''}
						{/if}
					{/each}
					{#if answer}
						<ChatMessage type="assistant" message={answer} />
					{/if}
					{#if isLoading}
						<div class="loading loading-dots loading-md"></div>
					{/if}
				</div>
				<div class="" bind:this={scrollToDiv} />
			</div>

			<form
				class="bg-neutral-focus flex w-full gap-4 rounded-md p-4"
				on:submit|preventDefault={() => handleSubmit()}
			>
				<Input
					type="text"
					bind:value={query}
					placeholder="Type your message here..."
					class="input-bordered w-full"
				/>
				<Button type="submit" class="btn btn-primary" disabled={isLoading || !query.trim()}>
					Send
				</Button>
			</form>
		{/if}
	</div>
</Card>
