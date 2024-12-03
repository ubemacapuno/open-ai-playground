<script lang="ts">
	// In newer versions of OpenAI, we can define the role type directly
	type ChatRole = 'user' | 'assistant' | 'system' | 'function';

	export let type: ChatRole;
	export let message: string;

	// Function to copy text to the clipboard
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(message);
			console.log('Text copied to clipboard');
			// sendToast('Text copied to clipboard', 'success')
		} catch (err) {
			console.log('Failed to copy text: ', err);
			// sendToast('Failed to copy text', 'error')
		}
	}
</script>

<div class="chat {type === 'user' ? 'chat-end' : 'chat-start'} justify-end">
	<div class="chat-image avatar online z-0">
		{#if type === 'user'}
			<div class="avatar online placeholder">
				<div class="bg-neutral-focus text-neutral-content w-10 rounded-full">TEST</div>
			</div>
		{:else}
			<div class="user_avatar_wrapper bg-neutral-focus text-secondary w-10 rounded-full">
				<span class="text-xl">🍪</span>
			</div>
		{/if}
	</div>
	<div class="chat-header">
		{type === 'user' ? 'Me' : 'Assistant'}
	</div>
	<div class="flex items-center">
		<div
			class="chat-bubble max-w-sm {type === 'user'
				? 'chat-bubble-primary'
				: 'chat-bubble-secondary'}"
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
