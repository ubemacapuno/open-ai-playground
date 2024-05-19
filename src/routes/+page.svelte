<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import Pdf from '$lib/components/PDF.svelte';

	type PdfData = {
		part_number: string;
		description: string;
		revision: string;
	};

	let fileInput: HTMLInputElement;
	let fileName = '';
	let accept: string = '.pdf';
	let pdfData = writable<PdfData>({ part_number: '', description: '', revision: '' });
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
			const result = await response.json();
			console.log('API Response:', result);
			if (typeof result.data === 'string') {
				pdfData.set(JSON.parse(result.data));
			} else {
				pdfData.set(result.data);
			}
			isProcessing = false;
		} else {
			console.error('Failed to upload and process PDF:', await response.text());
			isProcessing = false;
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
		fileName = currentFiles[0].name;
	}

	$: console.log('$pdfData:', $pdfData);
	// $pdfData shape example:
	// 	{
	//   "part_number": "0172",
	//   "description": "PBP, Linkage",
	//   "revision": "B"
	// }
</script>

<Button on:click={() => fileInput.click()} variant="outline">Import</Button>
<input on:change={onFilesChange} multiple bind:this={fileInput} type="file" hidden {accept} />
{#if isProcessing}
	<p>Processing...</p>
{/if}

<div class="flex justify-between">
	{#if $pdfData}
		<ul class="mt-4">
			{#if $pdfData && $pdfData.part_number}
				<div>
					<p><strong>Part Number:</strong> {$pdfData.part_number}</p>
					<p><strong>Description:</strong> {$pdfData.description}</p>
					<p><strong>Revision:</strong> {$pdfData.revision}</p>
				</div>
			{/if}
		</ul>
	{/if}
	<Pdf {src} {fileName} />
</div>
