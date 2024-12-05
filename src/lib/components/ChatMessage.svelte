<script lang="ts">
	type ChatRole = 'user' | 'assistant' | 'system' | 'function'

	export let type: ChatRole
	export let message: string

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(message)
			console.log('Text copied to clipboard')
		} catch (err) {
			console.log('Failed to copy text: ', err)
		}
	}
</script>

<div class={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
	<div class="chat-image avatar online z-0">
		{#if type !== 'user'}
			<div class="user_avatar_wrapper bg-neutral-focus text-secondary w-10 rounded-full">
				<span class="text-xl">🤖</span>
			</div>
		{/if}
	</div>
	<div class="flex flex-col">
		<div class="chat-header">
			{type !== 'user' ? 'Assistant' : 'Me'}
		</div>
		<div
			class={`chat-bubble max-w-sm ${type === 'user' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'} p-3 rounded-lg`}
		>
			{message}
			<slot />
			{#if type !== 'user'}
				<button on:click={copyToClipboard} class="btn btn-xs btn-secondary border-none">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="white"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-1m-6 4V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-6a2 2 0 01-2-2z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.user_avatar_wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
