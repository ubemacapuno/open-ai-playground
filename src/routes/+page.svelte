<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';

	let fileInput: HTMLInputElement;
	let accept: string = '.pdf';
	let pdfData = writable(null);

	const onFileUpload = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch('/api/upload/papa-parse', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			const { data } = await response.json();
			console.log('Parsed PDF data:', data);
			pdfData.set(data);
		} else {
			console.error('Failed to upload and process PDF:', await response.text());
		}
	};

	function onFilesChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const currentFiles = Array.from(input?.files ?? []);
		currentFiles.forEach((file) => {
			onFileUpload(file);
		});
		input.value = '';
	}
</script>

<h1 class="text-3xl font-bold underline">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Button on:click={() => fileInput.click()} variant="outline">Import</Button>
<input on:change={onFilesChange} multiple bind:this={fileInput} type="file" hidden {accept} />
