<script lang="ts">
	import { onMount } from 'svelte'

	export let message: string = ''
	export let typingSpeed: number = 10 // milliseconds per character
	let displayedMessage: string = ''
	let index: number = 0

	function typeMessage() {
		if (index < message.length) {
			displayedMessage += message.charAt(index)
			index++
			setTimeout(typeMessage, typingSpeed)
		}
	}

	onMount(() => {
		typeMessage()
	})
</script>

<div class="chat-bubble bg-green-500 text-white p-3 rounded-lg">
	{displayedMessage}
</div>

<style>
	.chat-bubble {
		max-width: 300px;
	}
</style>
