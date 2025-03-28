<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { TranscriptItem } from '$lib/utils/youtube'
	import { SSE } from 'sse.js'
	import { Input } from '$lib/components/ui/input'
	import { Button } from '$lib/components/ui/button'
	import { Card } from '$lib/components/ui/card'
	import { toast } from 'svelte-sonner'
	import type { PageData } from './$types'
	import CircleAlert from 'lucide-svelte/icons/circle-alert'
	import * as Alert from '$lib/components/ui/alert/index.js'

	export let data: PageData

	type ChatMessageType = {
		role: 'user' | 'assistant' | 'system' | 'function'
		content: string
		hidden?: boolean
	}

	$: ({ isProd } = data)

	let query: string = ''
	let answer: string = ''
	let isLoading: boolean = false
	let chatMessages: ChatMessageType[] = []
	let scrollToDiv: HTMLDivElement
	let youtubeUrl: string = ''
	let transcript: TranscriptItem[] | null = null
	let videoLoaded: boolean = false

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	function sanitizeYouTubeUrl(url: string) {
		// Check if the URL contains the seconds parameter
		if (url.includes('&t=')) {
			// Remove the seconds parameter for compatibility
			url = url.split('&t=')[0]
		}
		return url
	}

	async function handleSubmit(hideMessage: boolean = false) {
		isLoading = true
		chatMessages = [...chatMessages, { role: 'user', content: query, hidden: hideMessage }]

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
		toast.error('Error loading video')
	}

	async function handleTranscriptSubmit() {
		try {
			// sanitize the YouTube URL before using it
			youtubeUrl = sanitizeYouTubeUrl(youtubeUrl)

			const response = await fetch('/api/transcript', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: youtubeUrl })
			})

			const data = await response.json()
			if (data.error) throw new Error(data.error)

			transcript = data.transcript

			chatMessages = []
			query = 'Give up to a concise 3 sentence summary of the Youtube video without time stamps.'
			await handleSubmit(true) // pass true to hide the initial message

			videoLoaded = true
		} catch (error) {
			console.error(error)
			toast.error('Failed to fetch transcript')
		}
	}
</script>

{#if isProd}
	<Alert.Root variant="caution" class="mt-2">
		<CircleAlert class="h-4 w-4" />
		<Alert.Title
			>This feature is currently unavailable in production due to YouTube's API restrictions on
			cloud environments.</Alert.Title
		>
		<Alert.Description>
			For demonstration purposes, please try this feature in a local development environment. Read
			more about this issue on GitHub
			<a
				href="https://github.com/jdepoix/youtube-transcript-api/issues/303"
				class="text-blue-500 underline hover:text-blue-700"
			>
				Here
			</a>.
		</Alert.Description>
	</Alert.Root>
{/if}

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-5rem)]">
	<Card class="bg-neutral-focus mx-1 shadow-xl m-2 md:col-span-2 h-full">
		<div class="flex w-full flex-col items-start gap-2 px-2 py-4 h-full">
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
				<Button type="submit" class="btn btn-primary" disabled={isProd || !youtubeUrl.trim()}>
					Load Video
				</Button>
			</form>

			<!-- Iframe for Video -->
			{#if videoLoaded}
				<iframe
					title="Youtube Video"
					class="w-full h-64 flex-grow"
					src={`https://www.youtube.com/embed/${youtubeUrl.split('v=')[1]}`}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			{/if}
		</div>
	</Card>

	<!-- Card for Chat Messages -->
	<Card class="bg-neutral-focus mx-1 shadow-xl m-2 md:col-span-1 h-full">
		<div class="flex flex-col gap-2 px-2 py-4 h-full">
			<div>
				<h1 class="text-primary w-full flex-start text-2xl font-bold">Chat</h1>
			</div>
			<!-- show chat if transcript is loaded -->
			{#if transcript}
				<div class="bg-neutral flex h-full w-full flex-col gap-4 overflow-y-auto rounded-md p-4">
					<div class="flex flex-col gap-2">
						{#each chatMessages as message}
							{#if !message.hidden}
								<ChatMessage type={message.role} message={message.content} />
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
</div>
