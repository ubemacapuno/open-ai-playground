<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { writable } from 'svelte/store'
	import * as Card from '$lib/components/ui/card'

	type TypescriptTypeData = {
		typeDefinition: string
	}

	let fileInput: HTMLInputElement
	let isProcessing = false
	let tsTypes = writable<TypescriptTypeData | null>(null)
	let accept: string = '.csv'

	const onCsvFileUpload = async (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		isProcessing = true
		const response = await fetch('/api/csv-processor', {
			method: 'POST',
			body: formData
		})
		if (response.ok) {
			const result = await response.json()
			tsTypes.set(result)
			isProcessing = false
		} else {
			console.error('Failed to upload and process CSV:', await response.text())
			isProcessing = false
		}
	}

	function onCsvFilesChange(event: Event) {
		const input = event.target as HTMLInputElement
		const currentFiles = Array.from(input?.files ?? [])
		currentFiles.forEach((file) => {
			onCsvFileUpload(file)
		})
		input.value = ''
	}
</script>

<Button on:click={() => fileInput.click()} variant="outline">Import CSV File</Button>
<input on:change={onCsvFilesChange} bind:this={fileInput} type="file" hidden {accept} />

{#if isProcessing}
	<p>Processing...</p>
{/if}

{#if $tsTypes}
	<Card.Root class="max-w-lg rounded-lg p-4 shadow-md">
		<Card.Header>
			<Card.Title>CSV to TypeScript Definition</Card.Title>
		</Card.Header>
		<Card.Content>
			<pre>{$tsTypes.typeDefinition}</pre>
		</Card.Content>
	</Card.Root>
{/if}
