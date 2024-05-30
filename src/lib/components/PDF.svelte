<script lang="ts">
	export let src: string | undefined = undefined
	export let errorMessage = ''
	export let onDownload: (() => void) | undefined = undefined
	export let onOpen: (() => void) | undefined = undefined
	export let fileName = ''
</script>

<div class="relative w-3/4" style="height: 80vh;">
	<!-- TODO: Make a formatted error message component ? -->
	{#if errorMessage}
		<p class="text-red-500">Error: {errorMessage}</p>
	{:else if src}
		<div class="mb-2 flex items-center justify-between">
			{#if onDownload}
				<button
					class="btn rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
					on:click={onDownload}
				>
					Download
				</button>
			{/if}
			{#if onOpen}
				<button
					class="btn rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
					on:click={onOpen}
				>
					Open in New
				</button>
			{/if}
		</div>
		<p>{fileName}</p>
		{#key src}
			<iframe title="PDF Preview" src={`${src}#toolbar=1`} class="h-full w-full" allowfullscreen />
		{/key}
	{:else}
		<p>No document loaded.</p>
	{/if}
</div>
