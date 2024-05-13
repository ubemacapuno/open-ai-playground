<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import { toTitleCase } from '../utilities/transform';
	import Pdf from '$lib/components/PDF.svelte';

	let fileInput: HTMLInputElement;
	let accept: string = '.pdf';
	let pdfData = writable(null);
	let isProcessing = false;
	// Make a var src that holds the path to the pdf file that is uploaded
	let src = '';

	const onFileUpload = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);
		isProcessing = true;
		const response = await fetch('/api/pdf-processor', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			isProcessing = false;
			const { data } = await response.json();
			console.log('Parsed PDF data:', data);
			pdfData.set(data);
		} else {
			isProcessing = false;
			console.error('Failed to upload and process PDF:', await response.text());
		}
	};

	function onFilesChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const currentFiles = Array.from(input?.files ?? []);
		currentFiles.forEach((file) => {
			onFileUpload(file);
		});
		src = URL.createObjectURL(currentFiles[0]);
		input.value = '';
	}

	$: console.log('$pdfData:', $pdfData);

	// Example data for testing
	// const exampleData = {
	// 	part_number: '0172',
	// 	description: 'PBP, Linkage',
	// 	revision: 'B'
	// };
</script>

<h1 class="text-3xl font-bold underline">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Button on:click={() => fileInput.click()} variant="outline">Import</Button>
<input on:change={onFilesChange} multiple bind:this={fileInput} type="file" hidden {accept} />
{#if isProcessing}
	<p>Processing...</p>
{/if}

<div class="flex justify-between">
	{#if $pdfData}
		<ul class="mt-4">
			{#each Object.entries($pdfData) as [key, value]}
				<li>
					<span class="font-bold">{toTitleCase(key)}:</span>
					{value}
				</li>
			{/each}
		</ul>
	{/if}
	<Pdf {src} />
</div>
